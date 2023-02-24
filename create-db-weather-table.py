import sqlalchemy as sqla
from sqlalchemy import create_engine
import traceback
import glob
import os
from pprint import pprint
#import simplejson as json
import requests
import time
import datetime
from IPython.display import display

import pymysql

URI="dbbikes.cjk4ybuxtkwv.us-east-1.rds.amazonaws.com"
PORT="3306"
DB="dbbikes"
USER="cmcelduff"
PASSWORD="Tullamore1!"

#Connect to database
engine = create_engine("mysql+pymysql://{0}:{1}@{2}".format(USER, PASSWORD, URI), echo=True) 
connection = engine.connect()

sql = """
CREATE DATABASE IF NOT EXISTS dbikes;
"""
engine.execute(sql)

# command to check database is running
for res in engine.execute("SHOW VARIABLES;"):
    print(res)

sql_create_schema = "CREATE SCHEMA `dublin_bikes`;"
try:
    #res = engine.execute("DROP TABLE IF EXISTS station")
    res = engine.execute(sql_create_schema)
    print(res.fetchall())
except Exception as e:
    print(e)

# command to create table in mysql
sql_create_table = """
CREATE TABLE IF NOT EXISTS `dublin_bikes`.`weather` (
address VARCHAR(256),
banking INTEGER,
bike_stands INTEGER,
bonus INTEGER,
contact_name VARCHAR(256),
name VARCHAR(256),
number INTEGER,
position_lat REAL,
position_lng REAL,
status VARCHAR(256)
)
"""

try:
    #res = engine.execute("DROP TABLE IF EXISTS station")
    res = engine.execute(sql)
    print(res.fetchall())
except Exception as e:
    print(e)

    # tom test 
    # tom test 2 


NAME="Dublin"
STATIONS="https://api.jcdecaux.com/vls/v1/stations/"
DubBike_API = "7f06972a5ed335cf697379627fd13027274927c7"

def write_to_file(text):
    date_underscores = "{:%Y_%m_%d_%H_%M_%S}".format(datetime.datetime.now())
    with open(r"data\bikes_{}".format(date_underscores).replace(" ", "_"), "w") as f:
        f.write(text)

def stations_to_db(text):
    stations = json.loads(text)
    print(type(stations), len(stations))
    for station in stations:
        print(station)
        vals = (station.get("address"),int(station.get("banking")), int(station.get("bike_stands")), int(station.get("bonus")),station.get("contract_name"), station.get("name"), station.get("number"), station.get("position").get("lat"), station.get("position").get("lng"), station.get("status"))
        engine.execute("INSERT INTO `dublin_bikes`.`weather` values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", vals)
    return

def availability_to_db(text):
    stations = json.loads(text)
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
    print(os.path)
    while True:
        try:
            now = datetime.datetime.now()
            r = requests.get(STATIONS, params={"apiKey": DubBike_API, "contract" : NAME})
            print(r, now)
            write_to_file(r.text)
            stations_to_db(r.text)
            availability_to_db(r.text)
            time.sleep(5*60)
        except:
            print(traceback.format_exc())
            #if engine is None:
                #pass
        return

if __name__== "__main__":
    main()

NAME="Dublin"
STATIONS="https://api.jcdecaux.com/vls/v1/stations"
r = requests.get(STATIONS, params={"contract" : NAME, "apiKey": DubBike_API})


r.json()
