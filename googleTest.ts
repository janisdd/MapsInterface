//autor janis dähne
/// <reference path="./mapClusterer.ts"/>

var markers: Array<GoogleMapsMarker> = [];

var clusterer = new Clusterer()


var map : GoogleMapsMap = new GoogleMapsMap();

var marker11: GoogleMapsMarker

map.pre_init(() => {

  var host = document.getElementById("map-canvas");

  map.init(host, {lat: 50.49662772523053, lng: 11.03737506866455}, 14);

  var obenLinks: LatLng = { lat: 50.50562772523053, lng: 11.12037506866455 };
  var untenRechts: LatLng = { lat: 50.47962772523053, lng: 10.97037506866455 };



  var locations = [
    {
      lat: 50.4839756647083,
      lng: 10.962649659642018
    },
    {
      lat: 50.49510237306636,
      lng: 10.923335840603801
    },
    {
      lat: 50.49103326032916,
      lng: 10.95574306983454
    },
    {
      lat: 50.48729000576679,
      lng: 10.95061600660393
    },
    {
      lat: 50.480521859453525,
      lng: 10.92312496882351
    },
  ]

  var anzahl = 100;

  for (let i = 0; i < anzahl; i++) {


    var tempGeoLocation : LatLng = {
      lat: rndGoogle(obenLinks.lat, untenRechts.lat),
      lng: rndGoogle(obenLinks.lng, untenRechts.lng)
    };
    //var tempGeoLocation = locations[i]

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
  var clusters = clusterer.getClusters(markers, 20)

}

function setTextGoogle(text: string) {

  var textarea: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("textarea");

  textarea.value = text;
}

function rndGoogle(min:number, max:number) {
  return Math.random() * (max - min) + min;
}
