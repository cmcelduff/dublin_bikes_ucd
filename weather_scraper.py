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


def weather_to_db(weather):
    #tz = pytz.timezone('Europe/Dublin')
    #now = datetime.datetime.now(tz=tz)
    engine = create_engine("mysql+pymysql://{0}:{1}@{2}:{3}".format(USER, PASSWORD, URI, PORT), echo=True) 
    connection = engine.connect()
    now = datetime.now()
    vals = (now, weather["weather"][0]["main"], weather["weather"][0]["description"], int((weather["main"]["temp"])-273.15), int(weather["visibility"]), int(weather["wind"]["speed"]), int(weather["wind"]["deg"]), int(weather["main"]["pressure"]), int(weather["main"]["humidity"]))
    engine.execute("INSERT INTO `dublin_bikes`.`weather_current` values(%s,%s,%s,%s,%s,%s,%s,%s,%s)", vals)

    return 

def main():
    print(os.path)
    while True:
        try:
            # base URL
            BASE_URL = "https://api.openweathermap.org/data/2.5/weather?"
            CITY = "Dublin, IE"
            API_KEY = "f570baffe356fb97f527d1ba2c0f72d6"
            # upadting the URL
            URL = BASE_URL + "q=" + CITY + "&appid=" + API_KEY
            # HTTP request
            response = requests.get(URL)
            now = datetime.now()
            r = requests.get(BASE_URL, params={"contract" : CITY, "apiKey": API_KEY})
            weather = response.json()
            print(r, now)
            #write_to_file(r.text)
            weather_to_db(weather)
            time.sleep(5*60)
        except:
            print(traceback.format_exc())

if __name__ == '__main__':
    main()