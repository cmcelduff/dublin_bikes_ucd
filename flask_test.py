from flask import Flask, jsonify, render_template, request
import sqlalchemy as sqla 
from sqlalchemy import create_engine 
import pandas as pd
from joblib import dump, load
import json
from flask_googlecharts import LineChart
import numpy as np
from sqlalchemy.sql import text

from IPython.display import display
import pymysql
import requests
import traceback
from datetime import datetime
import time
import os

URI="dbbikes2.cytgvbje9wgu.us-east-1.rds.amazonaws.com"
PORT="3306"
DB="dbbikes2"
USER="admin"
PASSWORD="DublinBikes1"
STATIONS="https://api.jcdecaux.com/vls/v1/stations"
DubBike_API = "7f06972a5ed335cf697379627fd13027274927c7"
NAME="Dublin"

engine = create_engine("mysql+pymysql://{0}:{1}@{2}:{3}".format(USER, PASSWORD, URI, PORT), echo=True) 
connection = engine.connect() 


app = Flask(__name__)


@app.route("/")
def main():
    GMAP_API = "AIzaSyDb1zt2yFhv6A2dHezuG3hzGh9kva2R4OE"
    return render_template("index.html")


@app.route("/stations")
def stations():
    URI="dbbikes2.cytgvbje9wgu.us-east-1.rds.amazonaws.com"
    PORT="3306"
    DB="dbbikes2"
    USER="admin"
    PASSWORD="DublinBikes1"

    #Connect to database
    
    sql = "SELECT s.number, s.address, s.position_lat, s.position_lng, a.available_bike_stands, a.available_bikes, " \
          "MAX(a.datetime) AS `current_availability` " \
          "FROM dbbikes2.availability2 as a " \
          "INNER JOIN dbbikes2.station as s ON s.number = a.number " \
          "GROUP BY s.number " \
          "ORDER BY s.number;"           

    df = pd.read_sql(sql, engine)
    print(df)

    return df.to_json(orient="records")


@app.route("/static_stations")
def static_stations():     

    sql = "SELECT * FROM dbbikes2.station " \
          "ORDER BY address;"

    df = pd.read_sql(sql, engine)

    return df.to_json(orient="records")


@app.route('/occupancy/<int:number>')
def get_occupancy(number): 

    sql = text("""SELECT 
        s.address, 
        AVG(a.available_bike_stands) AS Avg_bike_stands,
        AVG(a.available_bikes) AS Avg_bikes_free,
        DATE_FORMAT(FROM_UNIXTIME(a.datetime), '%a') AS day_of_week
    FROM dbbikes2.station s 
    JOIN dbbikes2.availability2 a 
        ON s.number = a.number 
        AND DATE_FORMAT(FROM_UNIXTIME(a.datetime), '%a') IS NOT NULL
    WHERE s.number = :number
    GROUP BY s.address, day_of_week
    ORDER BY s.address, day_of_week;""")
    
    df = pd.read_sql(sql, engine, params={'number': number})

    # convert the pandas DataFrame to a JSON object
    occupancy_data = df.to_dict(orient="records")
    print(occupancy_data)

    # return a JSON response with the occupancy data
    return jsonify(occupancy_data)


@app.route("/weather_forecast")
def weather_forecast():

    sql = f"""SELECT *
    FROM dbbikes2.weather2
    ORDER BY datetime DESC
    LIMIT 1;"""

    df = pd.read_sql(sql, engine)
    df.reset_index(drop=True, inplace=True)

    return df.to_json(orient="records")


#pins for bikes
@app.route("/availability3")
def availability3():

    sql = f"""SELECT available_bikes
    FROM dbbikes2.availability2
    ORDER BY datetime DESC
    LIMIT 1;"""

    df = pd.read_sql(sql, engine)
    df.reset_index(drop=True, inplace=True)

    return df.to_json(orient="records")

    

@app.route('/predict/<int:station_id>/<int:day_of_week>/<int:hour_of_day>', methods=['POST'])
def predict(station_id, day_of_week, hour_of_day):
    model = load('new_predictions.joblib')
    avail_predict = model.predict([[station_id, 5, 2, day_of_week, hour_of_day]])

    predict_dict = {"bikes": int(avail_predict[0])} # convert to integer
    result = json.dumps(predict_dict)

    print(result)  # Print the result to the console

    return result, 200, {'Content-Type': 'application/json'}



if __name__ == "__main__":
    app.run(debug=True)