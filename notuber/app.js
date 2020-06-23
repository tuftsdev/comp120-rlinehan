function placeMarker(pos, map, icon) {
  return new google.maps.Marker({ position: pos, map: map, icon: icon });
}

function getDistance(carPos, myPos) {
  return google.maps.geometry.spherical.computeDistanceBetween(myPos, carPos)*0.000621371;
}

function getClosest(carPos, distances) {
  return carPos[distances.indexOf(Math.min(...distances))];
}

function makeRoute(myPos, carPos, map) {
  var route = new google.maps.Polyline({
    path: [{lat: myPos.lat(), lng: myPos.lng()}, {lat: carPos.lat(), lng: carPos.lng()}],
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  route.setMap(map);
}

function makeMeInfoWindow(marker, closestCar, distance) {
  var infoWindow = new google.maps.InfoWindow({
    content: '<div id="infoWindow"> <h1>You are here!</h1><p> Closest car ID: ' + closestCar.username +  '</p><p> Distance from you: ' + distance.toFixed(2) +  ' miles </p></div>'
  });
  infoWindow.open(map, marker);
}

function makeCarInfoWindow(car, distance) {
  var infoWindow = new google.maps.InfoWindow({
    content: '<div id="infoWindow"><p> Car ID: ' + car.username +  '</p><p> Distance from you: ' + distance.toFixed(2) +  ' miles </p></div>'
  });
  infoWindow.open(map, car.marker);
}

function initMap() {
    var map = new google.maps.Map(document.getElementById("map"), { center: { lat: 42.352271, lng: -71.05524200000001 }, zoom: 7 });
    var carIcon = { url: "car.png", scaledSize: new google.maps.Size(15, 35) };
    navigator.geolocation.getCurrentPosition(function(position) {
        myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var myMarker = placeMarker(myPos, map);
        var carsXHR = new XMLHttpRequest();
        carsXHR.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var cars = JSON.parse(this.responseText);
                var distances = new Array(cars.length);
                for (let i = 0; i < cars.length; i++) {
                    cars[i].latLng = new google.maps.LatLng(cars[i].lat, cars[i].lng);
                    cars[i].marker = placeMarker(cars[i].latLng, map, carIcon);
                    distances[i] = getDistance(myPos, cars[i].latLng);
                    cars[i].marker.addListener("click", function() {
                      console.log(cars[i]);
                      makeCarInfoWindow(cars[i], distances[i]);
                    });
                }
                var closestIndex = distances.indexOf(Math.min(...distances));
                myMarker.addListener("click", function() {
                    makeRoute(myPos, cars[closestIndex].latLng, map);
                    makeMeInfoWindow(myMarker, cars[closestIndex], distances[closestIndex]);
                });
            }
        }
        carsXHR.open("POST", "https://curl --data "username=whocares" https://damp-escarpment-52268.herokuapp.com/rides", true);
        carsXHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        carsXHR.send("username=jNtRRJiZ&lat=" + myPos.lat() + "&lng=" + myPos.lng());
    });
}
