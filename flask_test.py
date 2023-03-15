from flask import Flask, render_template
import sqlalchemy as sqla 
from sqlalchemy import create_engine 
import pandas as pd

from IPython.display import display
import pymysql
import requests
import traceback
import datetime
import time
import os

URI="dbbikes.cjk4ybuxtkwv.us-east-1.rds.amazonaws.com"
PORT="3306"
DB="dbbikes"
USER="cmcelduff"
PASSWORD="Tullamore1!"
STATIONS="https://api.jcdecaux.com/vls/v1/stations"
DubBike_API = "7f06972a5ed335cf697379627fd13027274927c7"
NAME="Dublin"

app = Flask(__name__)

@app.route("/")
def main():
    GMAP_API = "AIzaSyDb1zt2yFhv6A2dHezuG3hzGh9kva2R4OE"
    return render_template("index-peter.html")

@app.route("/stations")
def stations():
    URI="dbbikes.cjk4ybuxtkwv.us-east-1.rds.amazonaws.com"
    PORT="3306"
    DB="dbbikes"
    USER="cmcelduff"
    PASSWORD="Tullamore1!"

    #Connect to database
    engine = create_engine("mysql+pymysql://{0}:{1}@{2}:{3}".format(USER, PASSWORD, URI, PORT), echo=True) 
    connection = engine.connect()
    
    sql = "SELECT s.number, s.name, s.address, s.position_lat, s.position_lng, a.available_bike_stands, a.available_bikes, " \
          "MAX(a.last_update) AS `current_availability` " \
          "FROM dublin_bikes.availability as a " \
          "INNER JOIN dublin_bikes.station as s ON s.number = a.number " \
          "GROUP BY s.number " \
          "ORDER BY s.number;"

    df = pd.read_sql(sql, engine)
    print(df)

    return df.to_json(orient="records")

@app.route('/occupancy/<int:station_id>')
def get_occupancy(station_id):
    engine = create_engine("mysql+pymysql://{0}:{1}@{2}:{3}".format(USER, PASSWORD, URI, PORT), echo=True) 
    connection = engine.connect()  

    sql = f"""SELECT s.name, avg(a.available_bike_stands) as Avg_bike_stands,
        avg(a.available_bikes) as Avg_bikes_free
        FROM dublin_bikes.availability as a
        JOIN dublin_bikes.station as s
        ON s.number = a.number
        WHERE s.number = {station_id}
        GROUP BY s.name
        ORDER BY s.name;"""

    df = pd.read_sql(sql, engine)

    return df.to_json(orient="records")

@app.route("/weather_forecast")
def weather_forecast():
    engine = create_engine("mysql+pymysql://{0}:{1}@{2}:{3}".format(USER, PASSWORD, URI, PORT), echo=True)
    connection = engine.connect()  
    print("************************")

    sql = f"""SELECT time, weather_description, temp, wind_speed, humidity
    FROM dublin_bikes.weather_current
    ORDER BY time DESC
    LIMIT 1;"""

    df = pd.read_sql(sql, engine)
    df.reset_index(drop=True, inplace=True)

    return df.to_json()

if __name__ == "__main__":
    app.run(debug=True)

#peter