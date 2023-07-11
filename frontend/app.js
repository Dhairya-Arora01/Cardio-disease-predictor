const board_comp = Vue.component('board',{

    template: `
    <div id="board">
    <h1>Board Component</h1>
    <p>Age</p>
    <input type="number" placeholder="age" id="age" v-model="age">
    <p>Gender</p>
    <input type="radio" id="male" value="Male" v-model="gender">
    <label for="male">Male</label>
    <input type="radio" id="female" value="Female" v-model="gender">
    <label for="female">Female</label>
    <br>
    <p>Height</p>
    <input type="number" placeholder="height" id="height" v-model="height">
    <p>Weight</p>
    <input type="number" placeholder="weight" id="weight" v-model="weight">
    <p>Systolic Pressure</p>
    <input type="number" placeholder="Systolic Pressure" id="ap_hi" v-model="ap_hi">
    <p>Diastolic Pressure</p>
    <input type="number" placeholder="Diastolic Pressure" id="ap_lo" v-model="ap_lo">
    <p>Cholestrol</p>
    <input type="number" placeholder="Cholesterol" id="cholesterol" v-model="cholesterol">
    <p>Glucose</p>
    <input type="number" placeholder="Glucose" id="gluc" v-model="gluc">

    <p>Smoke</p>
    <input type="radio" id="yes" value="Yes" v-model="smoke">
    <label for="yes">Yes</label>
    <input type="radio" id="no" value="No" v-model="smoke">
    <label for="no">No</label>

    <p>Alcohol</p>
    <input type="radio" id="yes" value="Yes" v-model="alco">
    <label for="yes">Yes</label>
    <input type="radio" id="no" value="No" v-model="alco">
    <label for="no">No</label>

    <p>Active</p>
    <input type="radio" id="yes" value="Yes" v-model="active">
    <label for="yes">Yes</label>
    <input type="radio" id="no" value="No" v-model="active">
    <label for="no">No</label>


    <hr>

    <button v-on:click="submit">Submit</button>

    <hr>
    <div id="result">
        <h2>{{ probability }}%<h2>
    </div>

    <div>
    `,

    data: function(){
        return {

            age: 0,
            gender: "Male",
            height: 0,
            weight: 0,
            ap_hi: 0,
            ap_lo: 0,
            cholesterol: 0,
            gluc: 0,
            smoke: "No",
            alco: "No",
            active: "Yes",
            probability: 0

        }
    },

    methods: {

        async submit() {
            payload = {
                "age": this.age,
                "gender": this.gender,
                "height": this.height,
                "weight": this.weight,
                "ap_hi": this.ap_hi,
                "ap_lo": this.ap_lo,
                "cholesterol": this.cholesterol,
                "gluc": this.gluc,
                "smoke": this.smoke,
                "alco": this.alco,
                "active": this.active,
            }

            if (this.gender == "Female"){
                payload.gender = 1
            } else {
                payload.gender = 2
            }

            if (this.smoke == "No") {
                payload.smoke = 0
            } else {
                payload.smoke = 1
            }

            if (this.alco == "No") {
                payload.alco = 0
            } else {
                payload.alco = 1
            }

            if (this.active == "No") {
                payload.active = 0
            } else {
                payload.active = 1
            }

            console.log(payload)

            const res = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })


            const json_data = await res.json()
            data = JSON.parse(json_data)
            console.log(data)
            console.log(data['cardio'])
            this.probability = data['cardio']*100
        }

    }

}
)

const routes = [
    {
        path: '/',
        component: board_comp,
    },
]

const router = new VueRouter({routes})

const app = new Vue({
    el: '#main',
    router: router,
})