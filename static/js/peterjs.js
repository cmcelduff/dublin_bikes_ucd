
    var map;

    // Compile the Handlebars template for pop-up peter
    var template = Handlebars.compile("Handlebars <b>{{doesWhat}}</b>");

    function addMarkers(stations) {
      for (const station of stations) {
        console.log(station);
        var marker = new google.maps.Marker({
          position: {
            lat: station.position_lat,
            lng: station.position_lng,
          },
          map: map,
          title: station.name,
          station_number: station.number,
        });


          //HANDLEBARS
         // Add a click event listener to the marker
        marker.addListener("click", function() {
        // Compile the Handlebars template with a message
        var message = "Hello from station " + station.name;
        var compiledTemplate = template({ doesWhat: message });
  
        // Create an info window with the compiled template as content
        var infoWindow = new google.maps.InfoWindow({
          content: compiledTemplate,
        });
  
        // Open the info window on the clicked marker
        infoWindow.open(map, marker);
      });
      }
    }

    function getStations() {
      fetch("/stations")
        .then((response) => response.json())
        .then((data) => {
          console.log("fetch response", typeof data);
          addMarkers(data);
        });
    }

    // Initialize and add the map
    function initMap() {
      const dublin = { lat: 53.35014, lng: -6.266155 };
      // The map, centered at Dublin
      map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: dublin,
      });
      // const marker = new google.maps.Marker({
      // position: dublin,
      // map: map,
      // });
      getStations();
    }
    
    var map = null;
    window.initMap = initMap;
    
    
