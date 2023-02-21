# Import required libraries
import traceback

import requests
import json
import os



NAME = "Dublin"
STATIONS = "https://api.jcdecaux.com/vls/v1/stations"
API_KEY = "7f06972a5ed335cf697379627fd13027274927c7"

def main():
    while True:
        try:
            r = requests.get(STATIONS, params={"apiKey": API_KEY, "contract": NAME})

            store(json.loads(r.text))

            time.sleep(5*60)
        except:
            print(traceback.format_exc())
    return

# print(r.status_code)
#
# load = json.loads(r.text)
# print(load)
#print(r.text)
# print(r.url)
print("hello world")
<<<<<<< HEAD

=======
print("Test update")
>>>>>>> 57b3b8eec2898db1bf84924447c3d4c857112ace
