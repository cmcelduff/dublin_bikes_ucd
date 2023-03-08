
    var map;


    function addMarkers(stations) {
      for (const station of stations) {
        console.log(station);

        const infowindow = new google.maps.InfoWindow({
          content: station.name,
          ariaLabel: station.name,
        });

        const marker = new google.maps.Marker({
          position: {
            lat: station.position_lat,
            lng: station.position_lng,
          },
          map: map,
          title: station.name,
          station_number: station.number,
        });
        
        marker.addListener("click", () => {
          infowindow.open({
            anchor: marker,
            map,
          });
          
        });
        console.log(marker.position);
      }
    }

      // function addMarkerInfo() {
      //   _.forEach(stations, function(station)) {
      //       // console.log(station.name, station.number);
      //       var marker = new google.maps.Marker({
      //         position: {
      //           lat: station.position_lat,
      //           lng: station.position_lng,
      //         },
      //         map: map,
      //         title: station.name,
      //         station_number: station.number,
      //       });

      //     var contentString = '<div id="content"><h1>' + station.name + '</h1></div>'
      //       + '<div id="station_availability"></div>';

      //       const infowindow = new google.maps.InfoWindow({
      //         content: contentString,
      //         maxWidth: 200
      //     });

      //     marker.addListener('click', function () {
      //         closeOtherInfo();
      //         infowindow.open(marker.get('map'), marker);
      //         InforObj[0] = infowindow;
      //     });
      //     }
      //   }

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
    
  