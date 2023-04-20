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
import pickle

URI="dbbikes2.cytgvbje9wgu.us-east-1.rds.amazonaws.com"
PORT="3306"
DB="dbbikes2"
USER="admin"
PASSWORD="DublinBikes1"
STATIONS="https://api.jcdecaux.com/vls/v1/stations"
DubBike_API = "7f06972a5ed335cf697379627fd13027274927c7"
NAME="Dublin"

# opening pickle file with pretrained model
with open('MLModel/model.pkl', 'rb') as handle:
    model = pickle.load(handle)

##JCDeaux API Key
JCDEAUXAPI =  "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=8ad0fc88de299d032d91bc99f1e01c34a44d39a0"

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


@app.route("/predictions/<int:number>")
def predict(number):
    try:
        WEATHERAPI = "http://api.openweathermap.org/data/2.5/forecast?lat=53.3498&lon=6.2603&appid=d5de0b0a9c3cc6473da7d0005b3798ac"
        # Need to get Temperature, Wind Speed, Wind direction, Clouds 
        text = requests.get(WEATHERAPI).text
        forecast = json.loads(text)['list']
        predictions = {}

        text = requests.get(JCDEAUXAPI).text
        stations = json.loads(text)
        for station in stations:
            if station['number'] == number:
                stand_number = station['bike_stands'] 
                

        # initialize predictions dictionary for all seven days of the week
        for i in range(7):
            predictions[i] = {}
        
        for i in forecast:
            datetime_obj = datetime.fromtimestamp(i['dt'])
            hour = int(datetime_obj.strftime("%H"))
            day = int(datetime_obj.weekday())

            for j in range(5):
                df = pd.DataFrame(columns=["number","temp", "wind_speed","wind_direction","clouds","hour",'weekday_or_weekend_weekday','weekday_or_weekend_weekend'])
                df.loc[0, "number"] = number
                df.loc[0, "temp"] = i["main"]["temp"]
                df.loc[0, "wind_speed"] = i["wind"]["speed"]
                df.loc[0, "wind_direction"] = i["wind"]["deg"]
                df.loc[0, "clouds"] = i["clouds"]["all"]

                # Check in case it has gone into the next day
                if (hour + j) >= 24:
                    day += 1
                    if day == 7:
                        day = 0
                    hour -= 24
                df.loc[0, "hour"] = hour + j
                if day < 5:
                    df.loc[0, "weekday_or_weekend_weekend"] = 0
                    df.loc[0, "weekday_or_weekend_weekday"] = 1
                else:
                    df.loc[0, "weekday_or_weekend_weekend"] = 1
                    df.loc[0, "weekday_or_weekend_weekday"] = 0
                prediction = int(model.predict(df).tolist()[0])
                predictions[day][hour+j] = prediction
        for j in range(7):
            for i in range(24):
                try:
                    a = predictions[j][i]
                except:
                    df.loc[0, "hour"] = i
                    day = j
                    if day < 5:
                        df.loc[0, "weekday_or_weekend_weekend"] = 0
                        df.loc[0, "weekday_or_weekend_weekday"] = 1
                    else:
                        df.loc[0, "weekday_or_weekend_weekend"] = 1
                        df.loc[0, "weekday_or_weekend_weekday"] = 0
                    predictions[j][i] = int(model.predict(df).tolist()[0])
        predictions[8] = stand_number
        return predictions
    
    except Exception as e:
        print(traceback.format_exc())
        return "Error in get_predict: " + str(e), 404



# @app.route('/predict/<int:station_id>/<int:day_of_week>/<int:hour_of_day>', methods=['POST'])
# def predict(station_id, day_of_week, hour_of_day):
#     model = load('new_predictions.joblib')
#     avail_predict = model.predict([[station_id, 5, 2, day_of_week, hour_of_day]])

#     predict_dict = {"bikes": int(avail_predict[0])} # convert to integer
#     result = json.dumps(predict_dict)

#     print(result)  # Print the result to the console

#     return result, 200, {'Content-Type': 'application/json'}



if __name__ == "__main__":
    app.run(debug=True)