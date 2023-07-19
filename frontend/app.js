const board_comp = Vue.component('board',{

    template: `
    <div>
    <header class="titlebar">
            <span class="name">Cardio-B</span>
    </header>

    <section class="intro">
        <div class="text">
            <span class="title">Is your heart at risk ?</span>
            <p class="para">Check with our Cardio disease predictor now ! <br><span id="warning">*Our predictor is only 73% accurate, please seek medical help.</span></p>
        </div>
        <div class="gify">
            <img src="./images/heart.png" class="vert-move" style="width: 85%;height: auto;">
        </div>
    </section>

    <p class="lorem">Every year, millions of people around the world are affected by cardiovascular disease, making it one of the leading causes of death and disability. This group of disorders, including heart attacks, strokes, and coronary artery disease, poses a significant threat to our overall well-being. Cardiovascular disease is often influenced by a combination of factors, such as unhealthy lifestyle choices, genetic predisposition, high blood pressure, high cholesterol levels, obesity, and diabetes.The impact of cardiovascular disease extends beyond the physical realm, affecting individuals, families, and communities alike. It not only jeopardizes the quality of life but also places a tremendous burden on healthcare systems, straining resources and causing significant economic implications. The importance of prevention and early detection cannot be emphasized enough, as many risk factors are modifiable through lifestyle changes and proper management.
    </p>

    <section class="form">
        <div class="contactform">
            <h2>ENTER YOUR DETAILS</h2>
            <div class="formbox">
                <div class="inputbox w50">
                    <input type="number" required v-model="age">
                    <span>Age</span>
                </div>
                <div class="inputbox_select">
                    <span class="radio">Gender</span>
                    <input type="radio" name="gender_selection" value="Male" required v-model="gender">
                    <label for="Male">Male</label>
                    <input type="radio" name="gender_selection" value="Female" required v-model="gender">
                    <label for="Female">Female</label>
                </div>
                <div class="inputbox w50">
                    <input type="number" required v-model="height">
                    <span>Height (cm)</span>
                </div>
                <div class="inputbox w50">
                    <input type="number" required v-model="weight">
                    <span>Weight (Kg)</span>
                </div>
                <div class="inputbox_select">
                    <span class="radio">Do you smoke ?</span>
                    <input type="radio" name="smoke_selection" value="Yes" required v-model="smoke">
                    <label for="Yes">Yes</label>
                    <input type="radio" name="smoke_selection" value="No" required v-model="smoke">
                    <label for="No">No</label>
                </div>
                <div class="inputbox w50">
                    <input type="number" required v-model="ap_hi">
                    <span>Systolic pressure (mmHg)</span>
                </div>
                <div class="inputbox w50">
                    <input type="number" required v-model="ap_lo">
                    <span>Diastolic pressure (mmHg)</span>
                </div>
                <div class="inputbox_select">
                    <span class="radio">Do you drink alcohol ?</span>
                    <input type="radio" name="alcohol_selection" value="Yes" required v-model="alco">
                    <label for="Yes">Yes</label>
                    <input type="radio" name="alcohol_selection" value="No" required v-model="alco">
                    <label for="No">No</label>
                </div>
                <div class="inputbox w50">
                    <input type="number" required v-model="cholesterol">
                    <span>Cholesterol (mg/dL)</span>
                </div>
                <div class="inputbox w50">
                    <input type="number" required v-model="gluc">
                    <span>Glucose (mg/dL)</span>
                </div>
                <div class="inputbox_select">
                    <span class="radio">Are you active ?</span>
                    <input type="radio" name="active_selection" value="Yes" required v-model="active">
                    <label for="Yes">Yes</label>
                    <input type="radio" name="active_selection" value="No" required v-model="active">
                    <label for="No">No</label>
                </div>

                <h2>Probability : {{ probability }}%</h2>

                <div class="inputbox w50">
                    <input id="submit" type="button" v-on:click="submit" value="Submit" />
                </div>

                <!-- <p> Chance for disease: <span id="displaymessage"></span></p> -->

            </div>
        </div>
    </section>

    <div class="copyright">
        <p>Copyright &copy Dhairya, Aryan & Harsh . All Rights Reserved</p>
    </div>
    </div>
    `,

    data: function(){
        return {

            age: null,
            gender: null,
            height: null,
            weight: null,
            ap_hi: null,
            ap_lo: null,
            cholesterol: null,
            gluc: null,
            smoke: null,
            alco: null,
            active: null,
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

            const res = await fetch('168.61.20.95:5000/predict', {
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
            this.probability = Number(data['cardio']*100).toFixed(2)

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