# Various Imports for Python
import json
import os
import requests
import traceback
import datetime
import time

# Imports for MySQL
import pymysql
from sqlalchemy import create_engine



NAME = "Dublin"
STATIONS = "https://api.jcdecaux.com/vls/v1/stations"
API_KEY = "7f06972a5ed335cf697379627fd13027274927c7"

def stations_to_db(text, engine):
    """
    Read in static data of stations to the database
    This only needs to be run once
    No return value
    """
    #Read in stations to json object
    stations = json.loads(text)

    # Loop through stations, adding each one to the database
    for station in stations:
        #stations_values = (station.get("address"),int(station.get("banking")), int(station.get("bike_stands")), int(station.get("bonus")),station.get("contract_name"), station.get("name"), station.get("number"), station.get("position").get("lat"), station.get("position").get("lng"))
        engine.execute("INSERT INTO `dublin_bikes`.`station` values(%s,%s,%s,%s,%s,%s,%s,%s,%s)")
    return

def main():
    DB_USER = os.environ.get("cmcelduff")
    DB = os.environ.get("dbbikes")
    DB_URL = os.environ.get("dbbikes.cjk4ybuxtkwv.us-east-1.rds.amazonaws.com")
    DB_PORT = os.environ.get("3306")

    # API Key for Dublin Bikes JCDecaux & Other Variables for API
    DubBike_API = os.environ.get("7f06972a5ed335cf697379627fd13027274927c7")
    DubBike_NAME = "Dublin"
    DubBike_STATIONS = "https://api.jcdecaux.com/vls/v1/stations/"

    # Connect to database
    engine = create_engine("mysql+pymysql://{0}@{1}:{2}/{3}".format(DB_USER, DB_URL, DB_PORT, DB), echo=True)

    # Send requests to get all static data, then write to db
    r = requests.get(DubBike_STATIONS, params={"apiKey": DubBike_API, "contract": DubBike_NAME})
    stations_to_db(r.text, engine)

if __name__== "__main__":
    main()