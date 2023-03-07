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

def weather_to_db():
    CITY = "Dublin, IE"
    BASE_URL = "https://api.openweathermap.org/data/2.5/weather?"
    API_KEY = "f570baffe356fb97f527d1ba2c0f72d6"
    # upadting the URL
    URL = BASE_URL + "q=" + CITY + "&appid=" + API_KEY
    # HTTP request
    response = requests.get(URL)
    data = response.json()
    now = datetime.now()
    vals = (now, data["weather"][0]["description"], data["main"]["temp"]-273.15, data["visibility"], data["wind"]["speed"], data["wind"]["deg"], data["main"]["pressure"], data["main"]["humidity"])
    engine.execute("INSERT INTO `dublin_bikes`.`weather_current` values(%s,%s,%s,%s,%s,%s,%s,%s)", vals)
    return 

def main():
    try:
        while True:
            weather_to_db()
            time.sleep(1*60)
    except KeyboardInterrupt:
        print('Interrupted')
        return

if __name__ == '__main__':
    main()