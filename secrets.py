import os

NAME = "Dublin"
STATIONS = "https://api.jcdecaux.com/vls/v1/stations"
API_KEY = "7f06972a5ed335cf697379627fd13027274927c7"

DB_USER = os.environ.get("DB_USER")
DB_PASS = os.environ.get("DB_PASS")
DB_URL = os.environ.get("DB_URL")
DB_PORT = os.environ.get("DB_PORT")