let map;
let currWindow = false;

function initMap() {
    const markerArray = [];

    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 53.349834, lng: -6.260310 },
            zoom: 14,
        });

        function displayDropdown(stations) {
            stations.forEach(station => {
                const option = document.createElement("option");
                option.classList.add("option");
                option.value = station.address + ", Dublin";
                option.innerHTML = station.address;
                document.getElementById("start").appendChild(option);
            })
            
            stations.forEach(station=> {
                var option = document.createElement("option");
                option.classList.add("option");
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

            marker.addListener("click", () => { 
                if (currWindow) {
                    currWindow.close();
                }
                const infowindow = new google.maps.InfoWindow({
                    content:
                        "<h3>" +
                        station.name +
                        "</h3>" +
                        "<p><b>Available Bikes: </b>" +
                        station.available_bikes +
                        "</p>" +
                        "<p><b>Available Stands: </b>" +
                        station.available_bike_stands +
                        "</p>" +
                        "<p><b>Parking Slots: </b>" +
                        station.available_bike_stands +
                        "</p>" +
                        "<p><b>Status: </b>" +
                        station.status +
                        "</p>",
                });
                currWindow = infowindow;
                infowindow.open(map, marker);
                weeklyChart(station.number);
                hourlyChart(station.number);
            });
        });

        displayDropdown(data);

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

        let longpress;
        google.maps.event.addListener(map, "mousedown", function (event) {
            longpress = setTimeout(function () {
                const marker = new google.maps.Marker({
                    position: event.latLng,
                    map: map,
                    icon: {
                        url: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png'
                    }
                });
                console.log("Latitude:", event.latLng.lat());
                console.log("Longitude:", event.latLng.lng());
            }, 1000);
        });
        
        google.maps.event.addListener(map, "mouseup", function (event) {
            clearTimeout(longpress);
            // Get all markers within 1 km of the dropped marker
            const nearbyMarkers = markerArray.filter(function (marker) {
                return google.maps.geometry.spherical.computeDistanceBetween(marker.getPosition(), event.latLng) <= 1000;
            });
            // Change the color of nearby markers to pink
            pinkMarkers = nearbyMarkers.map(function (marker) {
                marker.setIcon({
                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                });
                return marker;
            });
        });
    });
}

function calculateAndDisplayRoute(
    directionsRenderer,
    directionsService,
    markerArray,
    stepDisplay,
    map
  ) {
    // First, remove any existing markers from the map.
    for (let i = 0; i < markerArray.length; i++) {
      markerArray[i].setMap(null);
    }
  
    // Retrieve the start and end locations and create a DirectionsRequest using
    // WALKING directions.
    directionsService
    .route({
      origin: document.getElementById("start").value,
      destination: document.getElementById("end").value,
      travelMode: google.maps.TravelMode.WALKING,
    })
    .then((result) => {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      document.getElementById("warnings-panel").innerHTML =
        "<b>" + result.routes[0].warnings + "</b>";
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
  
    for (let i = 0; i < myRoute.steps.length; i++) {
      const marker = (markerArray[i] =
        markerArray[i] || new google.maps.Marker());
  
      marker.setMap(map);
      marker.setPosition(myRoute.steps[i].start_location);
      attachInstructionText(
        stepDisplay,
        marker,
        myRoute.steps[i].instructions,
        map
      );
    }
  }

  function attachInstructionText(stepDisplay, marker, text, map) {
    google.maps.event.addListener(marker, "click", () => {
      // Open an info window when the marker is clicked on, containing the text
      // of the step.
      stepDisplay.setContent(text);
      stepDisplay.open(map, marker);
    });
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
    hourlyChart(choice);
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
            }
        });
    }).catch(err => {
        console.log("Error:", err);
    })
}


// Function to display weekly analysis chart
function weeklyChart(station_number) {
    fetch("/occupancy/" + station_number).then(response => {
        return response.json();
    }).then(data => {

        var chosenStationName;
        var analysis_title_output = "";

        Stn_Name = "";
        bike_stands = 0;
        bikes_free = 0;
        Iter_Count = 0;
        Day_Name = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        Day_Name_Abrv = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
        Average = [];
        for (i = 0; i < Day_Name.length; i++) {
            data.forEach(obj => {
                chosenStationName = obj.name;

                if (obj.DayName == Day_Name[i]) {
                    Stn_Name = obj.address;
                    bike_stands = obj.Avg_bike_stands;
                    bikes_free = bikes_free + obj.Avg_bikes_free;
                    Iter_Count = Iter_Count + 1;
                }
            })
            Average.push(bikes_free / Iter_Count);
            bikes_free = 0;
            Iter_Count = 0;
        }

        chart_data = new google.visualization.DataTable();
        options = {
            title: 'Average Availability Per Day',
            width: '700', height: '450',
            vAxis: {
                title: 'Number of Bikes'
            }
        };
        chart_data.addColumn('string', "Week_Day_No");
        chart_data.addColumn('number', "Average Bikes Available");

        for (i = 0; i < Day_Name.length; i++) {
            chart_data.addRow([Day_Name_Abrv[i], Average[i]]);
        }

        analysis_title_output = "<h2>" + chosenStationName + "</h2>";
        document.getElementById("analysis_title").innerHTML = analysis_title_output;

        chart = new google.visualization.ColumnChart(document.getElementById("weekly_chart"));
        chart.draw(chart_data, options);
    });


    //adding in nearby stations onto chart:
    




}


// Function to display hourly analysis chart
function hourlyChart(station_number) {
    fetch("/hourly/" + station_number).then(response => {
        return response.json();
    }).then(data => {

        chart_data = new google.visualization.DataTable();
        options = {
            title: 'Average Availability Per Hour',
            width: '700', height: '450',
            hAxis: {
                title: 'Hour of the Day (00:00)',
            },
            vAxis: {
                title: 'Number of Bikes'
            }
        };
        chart_data.addColumn('timeofday', "Time of Day");
        chart_data.addColumn('number', "Average Bikes Available");

        for (i = 0; i < data.length; i++) {
            chart_data.addRow([[data[i]['Hourly'], 0, 0], data[i]['Avg_bikes_free']]);
        }
        chart = new google.visualization.LineChart(document.getElementById('hour_chart'));
        chart.draw(chart_data, options);
    });
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


  function updateMarkerColor() {
    // get the selected station from the dropdown menu
    const selectedStation = document.getElementById("station_output").value;
    
    // loop over all markers on the map
    const markers = map.getMarkers();
    for (let i = 0; i < markers.length; i++) {
      const marker = markers[i];
  
      // calculate the distance between the marker and the selected station
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        marker.getPosition(),
        new google.maps.LatLng(position_lat, position_lng)
      );
  
      // if the distance is less than 1 km, change the marker color to green
      if (distance < 1000) {
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
      } else {
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
      }
    }
  }
  
  // add the updateMarkerColor function as a listener to the dropdown menu
  document.getElementById("station_output").addEventListener("change", updateMarkerColor);


window.initMap = initMap;