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
import pytz

def availability_to_db(text, engine):
    """
    Read in the dynamic data of each stations to the database
    This needs to be run every 5 minutes
    No return value
    """
    stations = json.loads(text)
    # set timezone
    for station in stations:
        vals = (int(station.get("number")), int(station.get("available_bikes")), int(station.get("available_bike_stands")), str(station.get("status")))
        engine.execute("INSERT INTO `dublin_bikes`.`availability` values(%s,%s,%s,%s)", vals)
    return
    


def main():
    USER = "cmcelduff"
    DB = "dbbikes"
    URI = "dbbikes.cjk4ybuxtkwv.us-east-1.rds.amazonaws.com"
    PORT = 3306
    PASSWORD = "Tullamore1!"

    # API Key for Dublin Bikes JCDecaux & Other Variables for API
    DubBike_API = "7f06972a5ed335cf697379627fd13027274927c7"
    DubBike_NAME = "Dublin"
    DubBike_STATIONS = "https://api.jcdecaux.com/vls/v1/stations/"

    # Connect to database
    engine = create_engine("mysql+pymysql://{0}:{1}@{2}:{3}".format(USER, PASSWORD, URI, PORT), echo=True)

    # Send requests to get all static data, then write to db
    failures = 0
    while True:
        try:
            r = requests.get(DubBike_STATIONS, params={"apiKey": DubBike_API, "contract": DubBike_NAME})
            availability_to_db(r.text, engine)
            failures = 0
            time.sleep(5 * 60)
        except AttributeError as e:
            print(traceback.format_exc() + "\n ERROR: please stop the script and check for errors, request not generated correctly")
            if failures < 5: failures += 1
            
            time.sleep(failures * 30)
            print("got to here")
        except Exception as e:
            print(traceback.format_exc() + "\n ERROR: please stop the script and check for errors unknown error occured")
            if failures < 5: failures += 1

            time.sleep(failures * 30)

if __name__== "__main__":
    main()