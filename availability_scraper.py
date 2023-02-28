import sqlalchemy as sqla 
from sqlalchemy import create_engine 
import traceback 
import glob 
import os 
import requests 
import time 
import json
from IPython.display import display
import pymysql
import requests
import traceback
import datetime
import time
import os


#Connect to database



def availability_to_db(text, engine):
    stations = json.loads(text)
    connection = engine.connect()
    #print(availability)
    for station in stations:
        #print(station.get("name"))
        #print(station.get("number"))
        #print(station.get("available_bikes"))
        #print(station.get("available_bike_stands"))
        #print(station.get("last_update"))
        vals = (int(station.get("number")), int(station.get("available_bikes")), int(station.get("available_bike_stands")), int(station.get("last_update")))
        engine.execute("INSERT INTO `dublin_bikes`.`availability` values(%s,%s,%s,%s)", vals)
    return

def main():
    URI="dbbikes.cjk4ybuxtkwv.us-east-1.rds.amazonaws.com"
    PORT="3306"
    DB="dbbikes"
    USER="cmcelduff"
    PASSWORD="Tullamore1!"
    STATIONS="https://api.jcdecaux.com/vls/v1/stations"
    DubBike_API = "7f06972a5ed335cf697379627fd13027274927c7"
    NAME="Dublin"
    print(os.path)
    engine = create_engine("mysql+pymysql://{0}:{1}@{2}:{3}".format(USER, PASSWORD, URI, PORT), echo=True) 
    while True:
        try:
            now = datetime.datetime.now()
            r = requests.get(STATIONS, params={"apiKey": DubBike_API, "contract" : NAME})
            print(r, now)
            availability_to_db(r.text, engine)
            time.sleep(5*60)
        except:
            print(traceback.format_exc())
            
if __name__== "__main__":
    main()