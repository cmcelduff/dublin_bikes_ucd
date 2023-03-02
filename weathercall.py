import requests
import json
import datetime as dt

BASE_URL = "http://api.openweathermap.org/data/2.5/weather?"
API_KEY = "13a747c8462fe1d8b7126b190b48a8ae"
CITY = "Dublin, IE"

url = BASE_URL + "appid=" + API_KEY + "&q=" + CITY
r = requests.get(url).json()

#showing all values
print(r)

#tempature convertion
def convert_temp(kelvin):
    celsius = kelvin - 273.15
    return celsius

#extracting from json
#temp
temp_k = r['main']['temp']
temp_c = convert_temp(temp_k)
#wind
wind = r['wind']['speed']
#status
status = r['weather'][0]['description']
#sun-set
sun_set = dt.datetime.utcfromtimestamp(r['sys']['sunset'])

print("------")
print(CITY)
print("------") 
print(wind)
print(temp_k)
print("Wind speed : {0:.2f}kph".format(wind))
print("Tempture : {0:.2f}C".format(temp_c))
print("Status : " + str(status))
print("Sun set : " + str(sun_set))

