let map;
var currWindow = false;

function initMap() {
    const markerArray = [];

    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {

        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 53.349834, lng: -6.260310 },
            zoom: 14,
        });

        //getStations();

        function displayDropdown(stations) {

            stations.forEach(station=> {
                var option = document.createElement("option");
                option.classList.add("option");
                option.value = station.address + ', Dublin';
                option.innerHTML = station.address;
                document.getElementById("start").appendChild(option);
            })
            
            stations.forEach(station=> {
                var option = document.createElement("option");
                option.classList.add("new_option");
                option.value = station.address + ', Dublin';
                option.innerHTML = station.address;
                document.getElementById("end").appendChild(option);
            })
        }

        data.forEach(station => {
            const marker = new google.maps.Marker({
                position: { lat: station.position_lat, lng: station.position_lng },
                map: map,
            });

            //HERE
            //pushing to station marker array
            stationMarkers.push(marker);
            //HERE

            marker.addListener("click", () => { 
                if (currWindow) {
                    currWindow.close();
                }
                const infowindow = new google.maps.InfoWindow({
                    content: "<h3>" + station.name + "</h3>"
                        + "<p><b>Available Bikes: </b>" + station.available_bikes + "</p>"
                        + "<p><b>Available Stands: </b>" + station.available_bike_stands + "</p>"
                        + "<p><b>Parking Slots: </b>" + station.available_bike_stands + "</p>"
                        + "<p><b>Status: </b>" + station.status + "</p>"
                });
                currWindow = infowindow;
                infowindow.open(map, marker);
                weeklyChart(station.number);
                hourlyChart(station.number);
            });
        });
        displayDropdown(data);
    })
    // Instantiate a directions service.
    const directionsService = new google.maps.DirectionsService();
    // Create a renderer for directions and bind it to the map.
    const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
    // Instantiate an info window to hold step text.
    const stepDisplay = new google.maps.InfoWindow();

    // Display the route between the initial start and end selections.
    calculateAndDisplayRoute(
    directionsRenderer,
    directionsService,
    markerArray,
    stepDisplay,
    map
    );
    // Listen to change events from the start and end lists.
  const onChangeHandler = function () {
    calculateAndDisplayRoute(
      directionsRenderer,
      directionsService,
      markerArray,
      stepDisplay,
      map
    );
  };
  document.getElementById("start").addEventListener("change", onChangeHandler);
  document.getElementById("end").addEventListener("change", onChangeHandler);

}


//ROUTE
function calculateAndDisplayRoute(
    directionsRenderer,
    directionsService,
    markerArray,
    stepDisplay,
    map,
  ) {
    // First, remove any existing markers from the map.
    for (let i = 0; i < markerArray.length; i++) {
      markerArray[i].setMap(null);
    }
  
    // Retrieve the start and end locations and create a DirectionsRequest using
    // WALKING directions.
    directionsService
    .route({
      //origin: document.getElementById("start").value,
      origin: selectedPinStart,
      destination: selectedPinEnd,
      travelMode: google.maps.TravelMode.WALKING,
    })
    .then((result) => {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      //document.getElementById("warnings-panel").innerHTML =
      //  "<b>" + result.routes[0].warnings + "</b>";
      directionsRenderer.setDirections(result);
      showSteps(result, markerArray, stepDisplay, map);
    })
    .catch((e) => {
      window.alert("Directions request failed due to " + e);
    });


}

function showSteps(directionResult, markerArray, stepDisplay, map) {
    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.
    const myRoute = directionResult.routes[0].legs[0];
  
    //setting values onto marker array in for loop to draw lines from start to end locations
    for (let i = 0; i < myRoute.steps.length; i++) {
      const marker = (markerArray[i] =
        markerArray[i] || new google.maps.Marker());
  
      marker.setMap(map);
      marker.setPosition(myRoute.steps[i].start_location);
    }
  }

// Function to populate the select dropdown menu for possible dates
function stationDropDown() {
    fetch("/static_stations").then(response => {
        return response.json();
    }).then(data => {

        var station_output = "<label for='station_option'>Choose a nearby station: </label>"
            + "<select name='station_option' id='station_option' onchange='setValue(this)'>"
            + "<option value='' disabled selected> ------------- </option><br>";

        data.forEach(station => {
            station_output += "<option value=" + station.number + ">" + station.name + "</option><br>";
        })

        station_output += "</select>";
        document.getElementById("station_selection").innerHTML = station_output;
    }).catch(err => {
        console.log("Error:", err);
    })
}


// Function to set user choice station and trigger other functions
function setValue(control) {
    var choice = control.value;
    showSelected(choice);
    weeklyChart(choice);
}

// Function to display info window for chosen station
function showSelected(chosenStation) {
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {

        data.forEach(station => {
            if (station.number == chosenStation) {

                if (currWindow) {
                    currWindow.close();
                }

                const marker = new google.maps.Marker({
                    position: { lat: station.pos_lat, lng: station.pos_lng },
                    map: map,
                });

                const infowindow = new google.maps.InfoWindow({
                    content: "<h3>" + station.address + "</h3>"
                        + "<p><b>Available Bikes: </b>" + station.available_bikes + "</p>"
                        + "<p><b>Available Stands: </b>" + station.available_bike_stands + "</p>"
                });
                currWindow = infowindow;
                infowindow.open(map, marker);
            }
        });
    }).catch(err => {
        console.log("Error:", err);
    })
}


// Function to display weekly analysis chart
function weeklyChart(station_number) {
  fetch(`/occupancy/${station_number}`)
    .then(response => response.json())
    .then(data => {
      const chart_data = new google.visualization.DataTable();
      chart_data.addColumn("string", "Week_Day_No");
      chart_data.addColumn("number", "Average Bikes Available");
      chart_data.addColumn("number", "Average Bike Stands");

      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      const rows = dayNames.map(dayName => {
        const matchingData = data.find(obj => obj.day_of_week === dayName);
        return [dayName, matchingData ? matchingData.Avg_bikes_free : null, matchingData ? matchingData.Avg_bike_stands : null];
      });

      chart_data.addRows(rows);

      const chosenStationName = data[0].address;

      const options = {
        title: "Average Availability Per Day",
        width: "400px",
        height: "500px",
        vAxis: {
          title: "Number of Bikes"
        }
      };

      document.getElementById("analysis_title").innerHTML = `<h6>${chosenStationName}</h>`;

      // Clear the contents of the "weekly_chart" div
      document.getElementById("weekly_chart").innerHTML = "";

      const chart = new google.visualization.ColumnChart(document.getElementById("weekly_chart"));
      chart.draw(chart_data, options);
    });


    //adding in nearby stations onto chart:
    




}


function capitalise(str) {
    let result = str[0].toUpperCase();
    for (let i = 1; i < str.length; i++) {
        if (str[i - 1] === ' ') {
            result += str[i].toUpperCase();
        } else {
            result += str[i];
        }
    }
    return result;
}

// Function to display weather forecast
function displayWeather() {
    fetch("/weather_forecast").then(response => {
        return response.json();
    }).then(data => {

        console.log(data);

        //    var today = new Date();
        //    var current_date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        //    var current_time = today.getHours();
        //    console.log(current_date);
        //    console.log(current_time);

        var weather_output = "<ul>" + "<li><b>Current Temperature: </b>" + data[0].temp + "°C</li>"
            + "<li><b>Wind Speed: </b>" + data[0].wind_speed + "</li>"
            + "<li><b>Weather Description: </b>" + capitalise(data[0].weather_description) + "</li>"
            + "<li><b>Humidity: </b>" + data[0].humidity + "%</li></ul>";

        document.getElementById("weather").innerHTML = weather_output;
    }).catch(err => {
        console.log("Error:", err);
    })
}


//MACHINE LEARNING PULL (PRESENT VALUES HERE NOT PULL)
//Fetching data for sikit-learn ML
fetch("/available_bike_stands")
  .then(response => response.json())
  .then(data => {
    const availabilityData = data;
    // use availabilityData as needed
    console.log("--------------")
    console.log(availabilityData)
  });





window.initMap = initMap;