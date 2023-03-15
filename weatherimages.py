#text to images
import requests
import json
import datetime as dt

BASE_URL = "http://api.openweathermap.org/data/2.5/weather?"
API_KEY = "13a747c8462fe1d8b7126b190b48a8ae"
CITY = "Dublin, IE"

url = BASE_URL + "appid=" + API_KEY + "&q=" + CITY
r = requests.get(url).json()

#showing all values
status = r['weather'][0]['description']
print(status)



