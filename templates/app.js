let map;
var currWindow = false;

function initMap() {
    fetch("/stations").then(response => {
        return response.json();
    }).then(data => {

        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 53.349834, lng: -6.260310 },
            zoom: 14,
        });

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
                content: "<h3>" + station.name + "</h3>"
                + "<p><b>Available Bikes: </b>" + station.available_bikes + "</p>"
                + "<p><b>Available Stands: </b>" + station.available_bike_stands + "</p>"
                + "<p><b>Parking Slots: </b>" + station.available_bike_stands + "</p>"
                + "<p><b>Status: </b>" + station.status + "</p>"
                });
                currWindow = infowindow;
                infowindow.open(map, marker);
                
            });
        });
    }).catch(err => {
        console.log("Error:", err);
    })
}


// Function to populate the select dropdown menu for possible dates
function stationDropDown() {
    fetch("/static_stations").then(response => {
        return response.json();
    }).then(data => {

    var station_output = "<label for='station_option'>Choose a station: </label>"
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