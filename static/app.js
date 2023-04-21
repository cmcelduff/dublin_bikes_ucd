let map;
let currWindow = false;
const markerArray = [];
const stationMarkers = [];
const markerANumbers = [];
let selectedPinStart = 0;
let selectedPinEnd = 0;
let selectedPinEndX = 0;
let routeSet = 0;
let setPinFlag = 0;
let flag2 = 0;

//globals for repopulating route
let DR = 0;
let DS = 0;
let MR = 0;
let SD = 0;
let MP = 0;

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


    const toggleSwitch = document.querySelector('#toggle-switch');

    toggleSwitch.addEventListener('change', () => {
    if (toggleSwitch.checked) {
        // Call the function when the switch is checked (toggled on)
        switchOn();
    } else {
        // Handle the case when the switch is unchecked (toggled off)
        switchOff();
    }
    });

    function switchOn() {
        setPinFlag = 1;
        console.log("The switch is on 1");
        console.log(setPinFlag);
        initMap();
    }

    function switchOff() {
        setPinFlag = 0;
        console.log("The switch is off 0");
        console.log(setPinFlag);
        initMap();
        
    }











    resetButton.addEventListener('click', function() {
      console.log("Hello, World!");

      //setting directions to null
      const emptyDirectionsResult = {
        routes: [],
        status: google.maps.DirectionsStatus.OK,
      };
      
      DR.setDirections(emptyDirectionsResult);


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
                    "<h6><u>" +
                    station.address +
                    "</u></h6>" +
                    "<p><b>Available Bikes: </b>" +
                    station.available_bikes +
                    "</p>" +
                    "<p><b>Available Stands: </b>" +
                    station.available_bike_stands +
                    "</p>",
                });
                currWindow = infowindow;
                infowindow.open(map, marker);
                weeklyChart(station.number);
                });
            });
        });
    });
  }
  
  window.addEventListener('load', init);



function initMap() {



    //make the map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 53.349834, lng: -6.260310 },
        zoom: 14,
    });

    //make the loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.style.position = 'absolute';
    loadingScreen.style.top = 0;
    loadingScreen.style.left = 0;
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.alignItems = 'center';

    const loadingWrapper = document.createElement('div');
    loadingWrapper.style.display = 'flex';
    loadingWrapper.style.flexDirection = 'column';
    loadingWrapper.style.alignItems = 'center';
    const loadingImage = document.createElement('img');
    loadingImage.src = 'static/css/bikegif.gif';
    //loadingImage.src = 'static/css/bill.JPG';
    loadingImage.style.borderRadius = '20%';
    loadingWrapper.appendChild(loadingImage);

    const loadingText = document.createElement('div');
    loadingText.textContent = 'Loading';
    loadingText.style.color = '#ffffff';
    loadingText.style.marginTop = '50px';
    loadingText.style.fontSize = '42px';
    loadingWrapper.appendChild(loadingText);

    loadingScreen.appendChild(loadingWrapper);

    document.getElementById("map").appendChild(loadingScreen);





    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {
        



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
                        "<h6><u>" +
                        station.address +
                        "</u></h6>" +
                        "<p><b>Available Bikes: </b>" +
                        station.available_bikes +
                        "</p>" +
                        "<p><b>Available Stands: </b>" +
                        station.available_bike_stands +
                        "</p>",
                });
                currWindow = infowindow;
                infowindow.open(map, marker);
                weeklyChart(station.number);
            });
        });
    
        
        // Instantiate a directions service.
        //clicking issue here
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
    

   
    
        if (setPinFlag == 1){ 
        
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

                //HERE DR
                console.log("M");
                if (routeSet == 1){

                    routeSet = 0;
                    const emptyDirectionsResult = {
                        routes: [],
                        status: google.maps.DirectionsStatus.OK,
                      };
                      
                      DR.setDirections(emptyDirectionsResult);
                }


                //longpress stuff 


                clearTimeout(longpress);
        
               
                console.log("mouseup even triggered");
                console.log("mouseup even triggered as function");
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
                                "<h6><u>" +
                                station.address +
                                "</h6></u>" +
                                "<p><b>Available Bikes: </b>" +
                                station.available_bikes +
                                "</p>" +
                                "<p><b>Available Stands: </b>" +
                                station.available_bike_stands +
                                "</p>" +
                                "<p><button type='button' id='end-btn'>Set as destination</button></p>",
                            });
                        
                            currWindow = infowindow;
                            infowindow.open(map, marker);
                            weeklyChart(station.number);
                            
                            infowindow.addListener("domready", () => {
                                const endButton = document.getElementById("end-btn");
                                endButton.addEventListener("click", () => {
                                helloWorld(station.position_lat, station.position_lng);
                                //here
                                infowindow.close();
                                });
                            });

                            });

                            }
                        }); 

                    }) 
                    .catch(error => {
                    console.log("Error fetching availability data", error);
                });
            

        });





            }, 1000);
        }

        //removing loading screen once loaded
        loadingScreen.style.display = 'none';
        
        });

        
        
        google.maps.event.addListener(map, "mouseup", function (event) {
            
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

    routeSet = 1;

    //maybe
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
                    content: "<h6><u>" + station.address + "</u></h6>"
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
    if (!station_number) {
        console.warn('weeklyChart function requires a station number');
        return;
      }
      
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

      document.getElementById("analysis_title").innerHTML = `<h6>${chosenStationName}</h6>`;

      // Clear the contents of the "weekly_chart" div
      document.getElementById("weekly_chart").innerHTML = "";

      const chart = new google.visualization.ColumnChart(document.getElementById("weekly_chart"));
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

        temp = Math.round(data[0].temp-273.15);

        var km = data[0].visibility / 1000;
        km = km.toFixed(1); // 1613.8 km
        

        var weather_output = "<ul>" + "<li><img src='static/css/temperature.png' width='40' height='40'>" + temp + "°C</li>"
            + "<li><img src='static/css/wind.png' width='35' height='35'>" + data[0].wind_speed + " m/s</li>"
            + "<li><li><img src='static/css/info.png' width='35' height='35'>" + capitalise(data[0].description) + "</li>"
            + "<li><img src='static/css/glasses.png' width='35' height='35'>" + km + " km</li></ul>";

        
        var tempature_output = temp;
        document.getElementById("tempature").innerHTML = tempature_output + "°C";

        var wind_output = data[0].wind_speed;
        document.getElementById("wind").innerHTML = wind_output + " m/s";

        var info_output = capitalise(data[0].description);
        document.getElementById("info").innerHTML = info_output;

        var vis_output = km;
        document.getElementById("vis").innerHTML = vis_output + " km";

        //document.getElementById("weather").innerHTML = weather_output;




    }).catch(err => {
        console.log("Error:", err);
    })
}


  
  // Function to populate the select dropdown menu for prediction
  function predictionDropDown() {
    fetch("/static_stations").then(response => {
        return response.json();
    }).then(data => {
        station_output = "<label for='station_option'>Choose a station: </label>"
            + "<select name='station_option' id='station_option' onchange='setPredictionValue(this)'>"
            + "<option value='' disabled selected> ------------- </option><br>";

        data.forEach(station => {
            station_output += "<option value='" + station.number + "' data-stationName='" + station.address + "'>" + station.address + "</option><br>";
        });

        station_output += "</select>";

        document.getElementById("prediction_area").innerHTML = station_output;

        // Add event listener to the form to call prediction() function
        var predict_button = document.getElementById("predict_button");
        predict_button.addEventListener("click", function (event) {
            event.preventDefault();
            var station_option = document.getElementById("station_option");

            var future_date = document.getElementById("future_date").value;
            var future_hour = document.getElementById("future_hour").value;

            var datetime = new Date(`${future_date}T${future_hour}:00`);

            const dayOfWeek = datetime.getDay(); // returns 0 for Sunday, 1 for Monday, and so on
            const hour = datetime.getHours();
            console.log(dayOfWeek, hour);
            getPrediction(station_option.value, dayOfWeek, hour);
        });
    }).catch(err => {
        console.log("Error:", err);
    })
}

function getPrediction(number, dayOfWeek, hour) {
    console.log("Number:", number);
    console.log("Day of Week:", dayOfWeek);
    console.log("Hour:", hour);

    fetch(`/predictions/${number}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log("Data received:", data);

        if (data && data[dayOfWeek] && data[dayOfWeek][hour] !== undefined) {
            document.getElementById("prediction_result").innerHTML = "<p> Number of available bikes: " + data[dayOfWeek][hour] + "</p>";
            var stands = data[8] - data[dayOfWeek][hour];
            document.getElementById("prediction_result").innerHTML += "<p> Number of available stands:" + stands + "</p>";
            console.log("Bikes available at the specified time:", data[dayOfWeek][hour]);
        } else {
            console.error("Invalid data:", data);
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });
}
  
  // Function to set user choice station and trigger prediction function
  function setPredictionValue(control) {
      var choice = control.value;
  }
  
window.initMap = initMap;