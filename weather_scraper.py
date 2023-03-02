import sqlalchemy as sqla
from sqlalchemy import create_engine
from sqlalchemy import MetaData
import traceback
import glob
import os
from pprint import pprint
#import simplejson as json
import requests
import time
from datetime import datetime
import json
from IPython.display import display
import pytz

import pymysql

URI="dbbikes.cjk4ybuxtkwv.us-east-1.rds.amazonaws.com"
PORT="3306"
DB="dbbikes"
USER="cmcelduff"
PASSWORD="Tullamore1!"

#Connect to database
engine = create_engine("mysql+pymysql://{0}:{1}@{2}:{3}".format(USER, PASSWORD, URI, PORT), echo=True) 
connection = engine.connect()

NAME="Dublin, IE"
Weather="https://api.openweathermap.org/data/2.5/weather?"
Weather_API = "f570baffe356fb97f527d1ba2c0f72d6"
r = requests.get(Weather, params={"contract" : NAME, "apiKey": Weather_API})

# base URL
BASE_URL = "https://api.openweathermap.org/data/2.5/weather?"
CITY = "Dublin, IE"
API_KEY = "f570baffe356fb97f527d1ba2c0f72d6"
# upadting the URL
URL = BASE_URL + "q=" + CITY + "&appid=" + API_KEY
# HTTP request
response = requests.get(URL)
data = response.json()

def weather_to_db(text):
    #tz = pytz.timezone('Europe/Dublin')
    #now = datetime.datetime.now(tz=tz)
    now = datetime.now()
    vals = (now,data["weather"][0]["description"], data["main"]["temp"], data["visibility"], data["wind"]["speed"], data["wind"]["deg"], data["main"]["pressure"], data["main"]["humidity"])
    engine.execute("INSERT INTO `dublin_bikes`.`weather_current` values(%s,%s,%s,%s,%s,%s,%s,%s)", vals)
    return 

                                        
def main():
    print(os.path)
    try:
        while True:
            now = datetime.now()
            r = requests.get(Weather, params={"contract" : NAME, "apiKey": Weather_API})
            print(r, now)
            #write_to_file(r.text)
            weather_to_db(r.text)
            time.sleep(5*60)
    except KeyboardInterrupt:
        print('Interrupted')
        #if engine is None:
            #pass
    return


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(130)
        except SystemExit:
            os._exit(130)