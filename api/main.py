from flask import Flask
from flask_restful import Api, Resource, reqparse, abort
import copy
import pickle
import pandas as pd
import json

app = Flask(__name__)
api = Api(app)

with open('model_pickle', 'rb') as f:
    our_model = pickle.load(f)
# defining the input args
predict_post_args = reqparse.RequestParser()

args_map = {
    'age': [int, "age of the person"],
    'gender': [int, "gender of the person"],
    'height': [int, "height of the person"],
    'weight': [int, "weight of the person"],
    'ap_hi': [int, "systolic pressure"],
    'ap_lo': [int, "diastolic pressure"],
    'cholesterol': [int, "cholesterol"],
    'gluc': [int, "glucose"],
    'smoke': [int, "do the person smoke"],
    'alco': [int, "do the person drink alcohol"],
    'active': [int, "is the person active"]
}

for feature, detail in args_map.items():
    predict_post_args.add_argument(feature, type=detail[0], help=detail[1])

def validator(input_received):

    valid = True

    if input_received.keys() != args_map.keys():
        valid = False

    if (input_received['age'] < 0) | (input_received['height'] < 0) | (input_received['weight'] < 0):
        valid = False

    if (input_received['ap_hi'] < 0) | (input_received['ap_lo'] < 0) | (input_received['gluc'] < 0) | (input_received['cholesterol'] < 0):
        valid = False

    if (input_received['gender'] not in [1, 2]) | (input_received['smoke'] not in [0, 1]) | (input_received['alco'] not in [0, 1]) | (input_received['active'] not in [0, 1]):
        valid = False

    return valid

def value_to_class(input_received_request):

    input_received = copy.deepcopy(input_received_request)

    # fasting blood glucose
    if input_received['gluc'] < 99:
        input_received['gluc'] = 1
    
    elif input_received['gluc'] < 125:
        input_received['gluc'] = 2
    
    else:
        input_received['gluc'] = 3

    if input_received['cholesterol'] < 200:
        input_received['cholesterol'] = 1
    
    elif input_received['cholesterol'] < 240:
        input_received['cholesterol'] = 2
    
    else:
        input_received['cholesterol'] = 3 

    return input_received

def predict_result(input_recieved):

    df = pd.DataFrame(input_recieved, index=[0])
    prediction = our_model.predict(df)

    return prediction

class Predictor(Resource):
    def post(self):

        input_received = predict_post_args.parse_args()

        valid = validator(input_received)
        if not valid:
            abort(403, message="Invalid inputs")

        input_received = value_to_class(input_received)

        prediction = predict_result(input_received)

        print(prediction)

        return json.dumps({"cardio": prediction[0]}, default=str), 200

api.add_resource(Predictor, "/predict")

if __name__=='__main__':
    app.run(debug=True)