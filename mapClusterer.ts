
var img0 = "Images/0.png"
var img1 = "Images/1.png"
var img2 = "Images/2.png"
var img3 = "Images/3.png"

var cross = "Images/x.png"
var dot = "Images/dot.png"
var dot2 = "Images/dot2.png"

var minMarkers = 2
var maxMarkers = 10

var delay = 3000
var drawrCrosses = false
var drawSector = false

interface Cluster {

  node: QuadTreeNode
  markers: Marker[]

}

interface ViewPort {
    topLeft: LatLng
    bottomRight: LatLng
}

interface QuadTreeNode {
  parentNode: QuadTreeNode
  markers: Marker[]
  level: number,
  subNodes: QuadTreeNode[]
}

class Clusterer {


  getClusters(markers: Marker[], maxDepth: number) : Cluster[] {

    var viewPort = this.getViewPort(markers)

    var root: QuadTreeNode = {
      parentNode: null,
      markers: [],
      level: 0,
      subNodes: []
    }

    //create the quadtree
    this.createQuadTree(viewPort, markers, root, maxDepth)


    //if 2 or more markers are in one quadtree node --> create cluster
    var clusters: Cluster[] = []

    this.getClustersRec(root, clusters)

    var self = this

setTimeout(function() {

  for (var i = 0; i < clusters.length; i++) {
      let cluster: Cluster = clusters[i];

      console.log(cluster)

      //create a new marker for the cluster(marker)

      let _viewPort = self.getViewPort(cluster.markers)

      let centerX = _viewPort.topLeft.lng + ((_viewPort.bottomRight.lng - _viewPort.topLeft.lng) / 2)
      let centerY = _viewPort.bottomRight.lat + ((_viewPort.topLeft.lat - _viewPort.bottomRight.lat) / 2)

      let clusterMarker = map.addMarkerFromGeoLocation({
        lat: centerY,
        lng: centerX
      }, dot)

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

        }, 2000)


      })

      //hide all markers in this cluster
      for (let n = 0; n < cluster.markers.length; n++) {
          let marker: Marker = cluster.markers[n];
          marker.setVisibility(false)
      }
  }
}, 2000)



    return clusters;
  }

  private getClustersRec(root: QuadTreeNode, clusters: Cluster[]) {

    for (let i = 0; i < root.subNodes.length; i++) {
        var subNode: QuadTreeNode = root.subNodes[i];

        if (subNode.markers.length >= minMarkers && subNode.markers.length <= maxMarkers) {
          var cluster: Cluster = {
            node: subNode,
            markers: subNode.markers
          }

          clusters.push(cluster)

        } else {

          this.getClustersRec(subNode, clusters)

        }
    }


  }


  private getViewPort(markers: Marker[]) : ViewPort {

    if (markers.length === 0) return

    var firstLocation = markers[0].getLocation()

    var viewPort = {
      topLeft: {lat: firstLocation.lat, lng: firstLocation.lng},
      bottomRight: {lat: firstLocation.lat, lng: firstLocation.lng}
    }

    for (let i = 1; i < markers.length; i++) {
        var marker = markers[i];

        var locaiton = marker.getLocation()

        if (locaiton.lat > viewPort.topLeft.lat)
          viewPort.topLeft.lat = locaiton.lat

        if (locaiton.lng < viewPort.topLeft.lng)
          viewPort.topLeft.lng = locaiton.lng

        if (locaiton.lat < viewPort.bottomRight.lat)
          viewPort.bottomRight.lat = locaiton.lat

        if (locaiton.lng > viewPort.bottomRight.lng)
          viewPort.bottomRight.lng = locaiton.lng

    }

    return viewPort
  }


  private createQuadTree(viewport: ViewPort, markers: Marker[], root: QuadTreeNode, maxDepth: number) {

    var self = this

    if (root.level > maxDepth) {
      console.log("hit")
      return
    }

    //root.markers = []


    var child0 : QuadTreeNode = { //top left
      parentNode: root,
      markers: [],
      level: root.level + 1,
      subNodes: []
    }

    var child1 : QuadTreeNode = { //top right
      parentNode: root,
      markers: [],
      level: root.level + 1,
      subNodes: []
    }

    var child2 : QuadTreeNode = { //bot left
      parentNode: root,
      markers: [],
      level: root.level + 1,
      subNodes: []
    }

    var child3 : QuadTreeNode = { //bot right
      parentNode: root,
      markers: [],
      level: root.level + 1,
      subNodes: []
    }

    root.subNodes[0] = child0
    root.subNodes[1] = child1
    root.subNodes[2] = child2
    root.subNodes[3] = child3


    //divide the viewport into 4 parts
    //for europe only!!
    //lng: longitude (laengengrad X) left: 0 - right: 100 %
    //lat: latitude (breitengrad Y) top: 0 - bot: 100%

    var centerX = viewport.topLeft.lng + ((viewport.bottomRight.lng - viewport.topLeft.lng) / 2)
    var centerY = viewport.bottomRight.lat + ((viewport.topLeft.lat - viewport.bottomRight.lat) / 2)

    console.log("lng: " + centerX + " lat: " + centerY)
    if (drawrCrosses)
      map.addMarkerFromGeoLocation({lat: centerY, lng: centerX}, cross, true, null)

    for (let i = 0; i < markers.length; i++) {
        let marker = markers[i];

        let location = marker.getLocation()

        if (location.lat > centerY) { //top side
          if (location.lng <= centerX) { //left side
              child0.markers.push(marker)
          } else { //location.lng > centerY //right side
              child0.markers.push(marker)
          }

        } else { //location.lat <= centerX //bottom side
          if (location.lng <= centerX) { //left side
              child2.markers.push(marker)
          } else { //location.lng > centerY //right side
            child3.markers.push(marker)
          }
        }
    }

    //next level

if (drawSector)
    for (let i = 0; i <child0.markers.length; i++) {
      let marker = child0.markers[i];
      marker.setIconPath(img0)
    }

    if (child0.markers.length > maxMarkers) { //top left

      let subViewPort: ViewPort = {
        topLeft: viewport.topLeft,
        bottomRight: {
          lat: centerY,
          lng: centerX
        }
      }


      //setTimeout(function() {
          self.createQuadTree(subViewPort, child0.markers, child0, maxDepth)
      //}, delay)
    }

if (drawSector)
    for (let i = 0; i <child1.markers.length; i++) {
      let marker = child1.markers[i];
      marker.setIconPath(img1)
    }

    if (child1.markers.length > maxMarkers) { //top right

      let subViewPort: ViewPort = {
        topLeft: {
          lat: viewport.topLeft.lat,
          lng: centerX
        },
        bottomRight: {
          lat: centerY,
          lng: viewport.bottomRight.lng
        }
      }

      //setTimeout(function() {
          self.createQuadTree(subViewPort, child1.markers, child1, maxDepth)
      //}, delay)
    }

if (drawSector)
    for (let i = 0; i <child2.markers.length; i++) {
      let marker = child2.markers[i];
      marker.setIconPath(img2)
    }

    if (child2.markers.length > maxMarkers) { //bottom left

      let subViewPort: ViewPort = {
        topLeft: {
          lat: centerY,
          lng: viewport.topLeft.lng
        },
        bottomRight: {
          lat: viewport.bottomRight.lat,
          lng: centerX
        }
      }

      //setTimeout(function() {
          self.createQuadTree(subViewPort, child2.markers, child2, maxDepth)
      //}, delay)


    }


if (drawSector)
    for (let i = 0; i <child3.markers.length; i++) {
      let marker = child3.markers[i];
      marker.setIconPath(img3)
    }

    if (child3.markers.length >  maxMarkers) { //bottom right

      let subViewPort: ViewPort = {
        topLeft: {
          lat: centerY,
          lng: centerX
        },
        bottomRight: viewport.bottomRight
      }

      //map.addMarkerFromGeoLocation(subViewPort.topLeft, dot, true, null)
      //map.addMarkerFromGeoLocation(subViewPort.bottomRight, dot2, true, null)

      //setTimeout(function() {
          self.createQuadTree(subViewPort, child3.markers, child2, maxDepth)
      //}, delay)
    }
  }

}
