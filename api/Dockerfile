FROM python:3.8-slim

WORKDIR /api

RUN pip install flask flask-restful flask-cors pandas scikit-learn

COPY . .

EXPOSE 5000

CMD ["python3", "-m" , "flask", "run", "--host=0.0.0.0"]