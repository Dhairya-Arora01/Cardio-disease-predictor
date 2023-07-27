terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0.2"
    }
  }

  required_version = ">= 0.12"
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "web-rg"
  location = "westus"
}

resource "azurerm_virtual_network" "vnet" {
  name                = "web-vnet"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "subnet" {
  name                 = "web-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
}

# public ip for server
resource "azurerm_public_ip" "public_ip" {
  name                = "web-public-ip"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  allocation_method   = "Static"
}

# network security group (nsg) to configure security rules for inbound/outbound traffic
resource "azurerm_network_security_group" "nsg" {
  name                = "web-nsg"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  security_rule {
    name                       = "frontend"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "api"
    priority                   = 200
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5000"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "ssh"
    priority                   = 300
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# binding nsg to the subnet
resource "azurerm_subnet_network_security_group_association" "subnet-nsg" {
  subnet_id                 = azurerm_subnet.subnet.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

# creating the network interface and binding public ip, subnet to it
resource "azurerm_network_interface" "nic" {
  name                = "web_nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "Internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.public_ip.id
  }
}

# creating an input variable
variable "key" {
  description = "The key for sshing into the vm"
  type        = string
  default     = "~/.ssh/id_rsa"
}

variable "username" {
  description = "The unsername of the user sshing"
  type        = string
  default     = "adminuser"
}

# creating a virtual machine with nginx as web server
resource "azurerm_linux_virtual_machine" "vm" {
  name                = "web-vm"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  size = "Standard_B1s"

  network_interface_ids = [azurerm_network_interface.nic.id]

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  admin_username = var.username
  admin_ssh_key {
    username   = var.username
    public_key = file("${var.key}.pub")
  }

  provisioner "remote-exec" {
    connection {
      type = "ssh"
      host        = self.public_ip_address
      user        = var.username
      private_key = file("${var.key}")
    }
    inline = [ 
      "sudo apt update",
      "sudo snap install docker",
      "sudo systemctl enable snap.docker.dockerd.service",
      "sudo systemctl start snap.docker.dockerd.service",
      "sudo docker pull dhairyarora0208/cardio-backend",
      "sudo docker run -p 5000:5000 -d dhairyarora0208/cardio-backend"

     ]
  }

}

# outputting the public_ip once the config is applied
output "public_ip" {
  value       = azurerm_linux_virtual_machine.vm.public_ip_address
  description = "The Public ip address of our server"
}