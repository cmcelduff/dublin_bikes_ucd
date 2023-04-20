let map;
let currWindow = false;
const markerArray = [];
const stationMarkers = [];
const markerANumbers = [];
let selectedPinStart = 0;
let selectedPinEnd = 0;
let selectedPinEndX = 0;


//globals for repopulating route
let DR = 0;
let DS = 0;
let MR = 0;
let SD = 0;
let MP = 0;




function init2(){
    console.log("WORLD");

}


function helloWorld(x,y) {
    console.log("World!");
    console.log("Calculate route is being called!");
    //S is the start location being fed into the function
    selectedPinStart = ({lat: x , lng: y});
    console.log("x pos lat + y pos lng");
    console.log(x);
    console.log(y);
    console.log(selectedPinEndX);
    selectedPinEnd = selectedPinEndX;
    calculateAndDisplayRoute(DR,DS,MR,SD,MP);
}



function init() {
    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', function() {
      console.log("Hello, World!");


       // Remove all markers from the map
        markerArray.forEach(function (marker) {
            marker.setMap(null);
        });

        // Clear the markerArray
        markerArray.length = 0;

        // Remove all station markers from the map
        stationMarkers.forEach(function (marker) {
            marker.setMap(null);
        });

        // Clear the stationMarkers array
        stationMarkers.length = 0;

        // Reload the initial markers
        fetch("/stations")
            .then(response => {
            return response.json();
            })
            .then(data => {
            data.forEach(station => {
                const marker = new google.maps.Marker({
                position: { lat: station.position_lat, lng: station.position_lng },
                map: map,
                });

                // Push the marker to the stationMarkers array
                stationMarkers.push(marker);

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
        });
    });


  }
  
  window.addEventListener('load', init);

function initMap() {

    //marker arrays go here
    
    

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

            //HERE
            //pushing to station marker array
            stationMarkers.push(marker);
            //HERE

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

        //set global
        DR = directionsRenderer;
        DS = directionsService;


        // Instantiate an info window to hold step text.
        const stepDisplay = new google.maps.InfoWindow();

        //Set global
        SD = stepDisplay;

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
        var icon = {
            url: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png',
            scaledSize: new google.maps.Size(40, 40)
        };

        google.maps.event.addListener(map, "mousedown", function (event) {
            console.log("mousedown event triggered");
            console.log(markerArray);
            console.log("marker array above");

            longpress = setTimeout(function () {
                const marker = new google.maps.Marker({
                    position: event.latLng,
                    map: map,
                    icon: icon
                });
                console.log("Latitude:", event.latLng.lat());
                console.log("Longitude:", event.latLng.lng());
                selectedPinEndX = ({lat: event.latLng.lat(), lng: event.latLng.lng()});

                markerArray.push(marker); // Push the marker to the array
                console.log(markerArray);
            }, 1000);
        });
        
        google.maps.event.addListener(map, "mouseup", function (event) {
            clearTimeout(longpress);
            // Remove all markers that are not within 1 km distance
            markerArray.forEach(function (marker) {
                if (google.maps.geometry.spherical.computeDistanceBetween(marker.getPosition(), event.latLng) > 1000) {
                    marker.setMap(null);
                }
            });


            //removes all origional station locations
                stationMarkers.forEach(marker => {
                    marker.setMap(null);
                });
                stationMarkers.length = 0;
            //end
            

            // Set the initial value of a_bikes to 0
            //let a_bikes = 0;

            // Get the station numbers of all stations within 1 km distance
            const stationNumbers = data.filter(station =>
                google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(station.position_lat, station.position_lng), event.latLng) <= 1000
            ).map(station => station.number);
            
            // Fetch availability data for all stations within 1 km distance
            fetch(`/availability3?numbers=${stationNumbers.join(',')}`)
                .then(response => response.json())
                .then(availabilityData => {
                console.log("availabilityData");
                console.log(availabilityData); // add this line to check the availability data
            
                // Add markers for all stations within 1 km distance
                data.forEach(station => {
                    if (google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(station.position_lat, station.position_lng), event.latLng) <= 1000) {
                    // Find the availability data for this station
                    const availability = availabilityData.find(item => item.number === station.number);
            
                    // Define the icon object with a color based on the available bikes
                    const icon = {
                        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    };
                    if (station.available_bikes >= 10) {
                        icon.url = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
                    } else if (station.available_bikes < 10 && station.available_bikes > 1) {
                        icon.url = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
                    }
            
                    const a_bikes = station.available_bikes; // Move declaration inside the callback
                    console.log(a_bikes); // Log the value of a_bikes to the console
                    const marker = new google.maps.Marker({
                        position: { lat: station.position_lat, lng: station.position_lng },
                        a_bikes: station.number,
                        map: map,
                        icon: icon
                    });
            
                    markerArray.push(marker);


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
                            "<p><button type='button' id='end-btn'>Set as destination</button></p>",
                        });
                    
                        currWindow = infowindow;
                        infowindow.open(map, marker);
                        weeklyChart(station.number);
                        hourlyChart(station.number);
                    
                        infowindow.addListener("domready", () => {
                            const endButton = document.getElementById("end-btn");

                            //HERE
                            endButton.addEventListener("click", helloWorld(station.position_lat,station.position_lng));
                          });




                    });
                    
                    
                    
                    
                    

                    


















                    }
                });
                })
                .catch(error => {
                console.log("Error fetching availability data", error);
                });


            
            
            

            /*
            data.forEach(function (station) {
                if (google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(station.position_lat, station.position_lng), event.latLng) <= 1000) {
                    fetch(`/availability2/${station.number}`).then(response => {
                        return response.json();
                    }).then(data => {
                        const icon = {
                            url: "",
                            scaledSize: new google.maps.Size(40, 40)
                        };
            
                        if (data.available_bikes >= 10) {
                            icon.url = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
                        } else if (data.available_bikes < 10 && data.available_bikes > 0) {
                            icon.url = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
                        } else {
                            icon.url = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
                        }
            
                        const marker = new google.maps.Marker({
                            position: { lat: station.position_lat, lng: station.position_lng },
                            map: map,
                            icon: icon
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
                                    data.available_bikes +
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
            
                        stationMarkers.push(marker);
                    });
                }
            });
            */



        });



    });
}


//ROUTE
function calculateAndDisplayRoute(
    directionsRenderer,
    directionsService,
    markerArray,
    stepDisplay,
    map,
  ) {

    //printing HERE
    console.log("function calculateAndDisplayRoute is being run");
    console.log(selectedPinStart);
    console.log(selectedPinEnd);

    

    // First, remove any existing markers from the map.
    //for (let i = 0; i < markerArray.length; i++) {
    //  markerArray[i].setMap(null);
    //}
  
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


    //adding in nearby stations onto chart:
    







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


        var weather_output = "<ul>" + "<li><b>Current Temperature: </b>" + data[0].temp + "°C</li>"
            + "<li><b>Wind Speed: </b>" + data[0].wind_speed + "</li>"
            + "<li><b>Weather Description: </b>" + capitalise(data[0].weather_description) + "</li>"
            + "<li><b>Humidity: </b>" + data[0].humidity + "%</li></ul>";

        document.getElementById("weather").innerHTML = weather_output;
    }).catch(err => {
        console.log("Error:", err);
    })
}


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