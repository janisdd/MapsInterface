
var img0 = "Images/0.png"
var img1 = "Images/1.png"
var img2 = "Images/2.png"
var img3 = "Images/3.png"

interface Cluster {

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


  getClusters(markers: Marker[]) : Cluster[] {

    var viewPort = this.getViewPort(markers)

    var root: QuadTreeNode = {
      parentNode: null,
      markers: [],
      level: 0,
      subNodes: []
    }

    this.createQuadTree(viewPort, markers, root)

    return null;

    for (let i = 0; i < root.subNodes[0].markers.length; i++) {
        let marker = root.subNodes[0].markers[i];
        marker.setIconPath(img0)
    }

    for (let i = 0; i < root.subNodes[1].markers.length; i++) {
        let marker = root.subNodes[1].markers[i];
        marker.setIconPath(img1)
    }

    for (let i = 0; i < root.subNodes[2].markers.length; i++) {
        let marker = root.subNodes[2].markers[i];
        marker.setIconPath(img2)
    }

    for (let i = 0; i < root.subNodes[3].markers.length; i++) {
        let marker = root.subNodes[3].markers[i];
        marker.setIconPath(img3)
    }

    return null;
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

        if (locaiton.lat < viewPort.topLeft.lat)
          viewPort.topLeft.lat = locaiton.lat

        if (locaiton.lng < viewPort.topLeft.lng)
          viewPort.topLeft.lng = locaiton.lng

        if (locaiton.lat > viewPort.bottomRight.lat)
          viewPort.bottomRight.lat = locaiton.lat

        if (locaiton.lng > viewPort.bottomRight.lng)
          viewPort.bottomRight.lng = locaiton.lng

    }

    return viewPort
  }


  private createQuadTree(viewport: ViewPort, markers: Marker[], root: QuadTreeNode) {

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

    map.addMarkerFromGeoLocation({lat: centerY, lng: centerX}, img0, true, null)

    for (let i = 0; i < markers.length; i++) {
        let marker = markers[i];

        let location = marker.getLocation()

        if (location.lat > centerY) { //top side
          if (location.lng <= centerX) { //left side
              child0.markers.push(marker)
          } else { //location.lng > centerY //right side
              child2.markers.push(marker)
          }

        } else { //location.lat <= centerX //bottom side
          if (location.lng <= centerX) { //left side
              child1.markers.push(marker)
          } else { //location.lng > centerY //right side
            child3.markers.push(marker)
          }
        }
    }

    //next level

    if (child0.markers.length > 1) { //top left

      let subViewPort: ViewPort = {
        topLeft: viewport.topLeft,
        bottomRight: {
          lat: centerX,
          lng: centerY
        }
      }

      for (let i = 0; i <child0.markers.length; i++) {
        let marker = child0.markers[i];
        marker.setIconPath(img0)
      }

      this.createQuadTree(subViewPort, child0.markers, child0)
    }

    if (child1.markers.length > 1) { //top right

      let subViewPort: ViewPort = {
        topLeft: {
          lat: centerX,
          lng: viewport.topLeft.lng
        },
        bottomRight: {
          lat: viewport.bottomRight.lat,
          lng: centerY
        }
      }

      for (let i = 0; i <child1.markers.length; i++) {
        let marker = child1.markers[i];
        marker.setIconPath(img1)
      }

      this.createQuadTree(subViewPort, child1.markers, child1)
    }

    if (child2.markers.length > 1) { //bottom left

      let subViewPort: ViewPort = {
        topLeft: {
          lat: viewport.topLeft.lat,
          lng: centerY
        },
        bottomRight: {
          lat: centerX,
          lng: viewport.bottomRight.lng
        }
      }

      for (let i = 0; i <child2.markers.length; i++) {
        let marker = child2.markers[i];
        marker.setIconPath(img2)
      }

      this.createQuadTree(subViewPort, child2.markers, child2)
    }

    if (child3.markers.length > 1) { //bottom right

      let subViewPort: ViewPort = {
        topLeft: {
          lat: centerX,
          lng: centerY
        },
        bottomRight: viewport.bottomRight
      }

      for (let i = 0; i <child3.markers.length; i++) {
        let marker = child3.markers[i];
        marker.setIconPath(img3)
      }

      this.createQuadTree(subViewPort, child3.markers, child3)
    }
  }

}
