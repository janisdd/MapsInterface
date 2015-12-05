/// <reference path="./mapClusterer.ts"/>
//autor janis dähne
//zuletzt bearbeitet von janis dähne: clusterer test hinzugefügt
//zuletzt bearbeitet von janis dähne: markieren von mehreren markern hinzugefügt

//'http://cdn.leafletjs.com/leaflet-0.5/images/marker-icon.png'

var dot = "Images/dot.png"

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




  //set up markieren

  let overlay = <HTMLDivElement>document.getElementById('map-canvas-overlay')


  MapSelectionHelper.Init(this.map, overlay, (selectedMarkers: Marker[], notSelectedMarkers: Marker[]) => {

    for (let i = 0; i < selectedMarkers.length; i++) {
      selectedMarkers[i].setIconPath('http://cdn.leafletjs.com/leaflet-0.5/images/marker-icon.png');
    }

    for (let j = 0; j < notSelectedMarkers.length; j++) {
        notSelectedMarkers[j].setIconPath('');
    }
  }, () => {
    console.log('selection end!')
  }, () => {
    console.log('selection started')
  })

  window.addEventListener('keypress', (ev: KeyboardEvent) => {

    let c = String.fromCharCode(ev.charCode)

    let mode = MapSelectionHelper.getInSelectionMode()
    if (c == 'S' && ev.shiftKey) {

      MapSelectionHelper.setInSelectionMode(!mode)
    }
  })

  //MapSelectionHelper.enableMultiSelection(overlay,'h')

/*
  overlay.addEventListener('mousemove', (ev: MouseEvent) => {

    if (markStart) {
      let indicator = document.getElementById('indicatorDiv')

      indicator.style.width = (ev.x - 20 - sX) + "px"
      indicator.style.height = (ev.y - sY - 20) + "px"

      let location = map.getGeoLocationFromXY({x: ev.x - 20, y: ev.y})

      let topLeft = {
        lat: Math.max(location.lat, markStart.lat),
        lng:  Math.min(location.lng, markStart.lng)
      }
      let bottomRight = {
        lat: Math.min(location.lat, markStart.lat),
        lng: Math.max(location.lng, markStart.lng),
      }

      let allmarkers = map.getAllMarkers()
      let markedMarkers = []

      for (let i = 0; i < allmarkers.length; i++) {
          let m = allmarkers[i];

          if (m.getLocation().lat < topLeft.lat && bottomRight.lat < m.getLocation().lat) {

            if (m.getLocation().lng < bottomRight.lng && topLeft.lng < m.getLocation().lng) {
              markedMarkers.push(m)
              m.setIconPath('http://cdn.leafletjs.com/leaflet-0.5/images/marker-icon.png')
              continue
            }
          }
          m.setIconPath('')
      }


    }

  })

  overlay.addEventListener('click', (ev: MouseEvent) => {

    let location = map.getGeoLocationFromXY({x: ev.x - 20, y: ev.y})

    if (!markStart) {
      markStart = location

      let indicator = document.getElementById('indicatorDiv')
      sX = (ev.x - 20)
      sY = ev.y
      indicator.style.left = sX + "px"
      indicator.style.top = sY + "px"

    } else {

      //get top left and bottom right point -> check all markers for intersection

      let topLeft = {
        lat: Math.max(location.lat, markStart.lat),
        lng:  Math.min(location.lng, markStart.lng)
      }
      let bottomRight = {
        lat: Math.min(location.lat, markStart.lat),
        lng: Math.max(location.lng, markStart.lng),
      }

      let allmarkers = map.getAllMarkers()
      let markedMarkers = []

      for (let i = 0; i < allmarkers.length; i++) {
          let m = allmarkers[i];

          if (m.getLocation().lat < topLeft.lat && bottomRight.lat < m.getLocation().lat) {

            if (m.getLocation().lng < bottomRight.lng && topLeft.lng < m.getLocation().lng) {
              markedMarkers.push(m)
              m.setIconPath('http://cdn.leafletjs.com/leaflet-0.5/images/marker-icon.png')
              continue
            }
          }
          m.setIconPath('')
      }
      markStart = null
    }
  })

*/
});



//TODO add cluster to map
//var clusters = clusterer.getClusters(markers)


function getCluster() {

  var clusters = Clusterer.getClusters(markers)

  test(clusters)

}

function setTextGoogle(text: string) {

  var textarea: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("textarea");

  textarea.value = text;
}

function rndGoogle(min:number, max:number) {
  return Math.random() * (max - min) + min;
}

var tempClusterMarkers: Marker[] = []

function test(clusters: Cluster[]) {

    var delay = 3000
    setTimeout(function() {

      for (var i = 0; i < clusters.length; i++) {
          let cluster: Cluster = clusters[i];

          console.log(cluster)

          //create a new marker for the cluster(marker)

          //let _viewPort = Clusterer.getViewPort(cluster.markers)

          // map.addMarkerFromGeoLocation(_viewPort.bottomRight, dot2)
          //map.addMarkerFromGeoLocation(_viewPort.topLeft, dot2)

          //let centerX = _viewPort.topLeft.lng + ((_viewPort.bottomRight.lng - _viewPort.topLeft.lng) / 2)
          //let centerY = _viewPort.bottomRight.lat + ((_viewPort.topLeft.lat - _viewPort.bottomRight.lat) / 2)

          let clusterMarker = map.addMarkerFromGeoLocation(cluster.center, dot)

          tempClusterMarkers.push(clusterMarker)

          map.addMarkerListener(GoogleMapsEventNames.click, clusterMarker, (marker: GoogleMapsMarker, ...originalArgs: any[]) => {

            clusterMarker.setVisibility(false)

            for (let j = 0; j < cluster.markers.length; j++) {
                let marker: Marker = cluster.markers[j];
                marker.setVisibility(true)
            }

            setTimeout(() => {

              clusterMarker.setVisibility(true)

              for (let l = 0; l < cluster.markers.length; l++) {
                  let marker: Marker = cluster.markers[l];
                  marker.setVisibility(false)
              }

            }, delay)


          })

          //hide all markers in this cluster
          for (let n = 0; n < cluster.markers.length; n++) {
              let marker: Marker = cluster.markers[n];
              marker.setVisibility(false)
          }
      }
    }, delay)
  }


var markStart: LatLng
var sX: number
var sY: number


function markiere() {

  //let overlay = document.getElementById('map-canvas-overlay')
  //overlay.style.display = 'inline'

  MapSelectionHelper.setSelectionMode(true)

}

function markiereNichtMehr() {

  //let overlay = document.getElementById('map-canvas-overlay')
  //overlay.style.display = 'none'

  MapSelectionHelper.setSelectionMode(false)

}
