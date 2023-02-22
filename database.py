import sqlalchemy as sqla
from sqlalchemy import create_engine
import traceback
import glob
import os
from pprint import pprint
import simplejson as json
import requests
import time
from IPython.display import display

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
    engine = create_engine("mysql+pymysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)

    sql = """"
    CREATE DATABASE IF NOT EXISTS dbikes;
    """
    engine.executes(sql)

    # Send requests to get all static data, then write to db
    r = requests.get(DubBike_STATIONS, params={"apiKey": DubBike_API, "contract": DubBike_NAME})
    stations_to_db(r.text, engine)

#if __name__== "__main__":
main()