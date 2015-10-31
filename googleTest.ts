//autor janis dähne
/// <reference path="./mapClusterer.ts"/>

var markers: Array<GoogleMapsMarker> = [];

var clusterer = new Clusterer()


var map : GoogleMapsMap = new GoogleMapsMap();

var marker11: GoogleMapsMarker

map.pre_init(() => {

  var host = document.getElementById("map-canvas");

  map.init(host, {lat: 50.49662772523053, lng: 10.93737506866455}, 16);

  var obenLinks: LatLng = { lat: 50.50562772523053, lng: 10.92037506866455 };
  var untenRechts: LatLng = { lat: 50.47962772523053, lng: 10.97037506866455 };

  var anzahl = 5;

  for (let i = 0; i < anzahl; i++) {

    var tempGeoLocation : LatLng = {
      lat: rndGoogle(obenLinks.lat, untenRechts.lat),
      lng: rndGoogle(obenLinks.lng, untenRechts.lng)
    };

     var marker1 = map.addMarkerFromGeoLocation(tempGeoLocation);
     markers.push(marker1);

     map.addMarkerListener(GoogleMapsEventNames.click, marker1, (marker: GoogleMapsMarker, ...originalArgs: any[]): void =>  {
        alert("id: " + marker.id + " pos: {lat: " + marker.location.lat + " - " + "lng: " + marker.location.lng + "}");
     });

     map.addMarkerListener(GoogleMapsEventNames.mouseover, marker1, (marker: Marker) => {
        this.setTextGoogle("lat: " + marker.getLocation().lat + " - lng: " + marker.getLocation().lng);
     });

  }
});


//TODO add cluster to map
//var clusters = clusterer.getClusters(markers)


function getCluster() {
  var clusters = clusterer.getClusters(markers)

}

function setTextGoogle(text: string) {

  var textarea: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("textarea");

  textarea.value = text;
}

function rndGoogle(min:number, max:number) {
  return Math.random() * (max - min) + min;
}
