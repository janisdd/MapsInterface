//autor janis dähne

var img0 = "Images/0.png"
var img1 = "Images/1.png"
var img2 = "Images/2.png"
var img3 = "Images/3.png"

var cross = "Images/x.png"
var dot = "Images/dot.png"
var dot2 = "Images/dot2.png"

/**
 * a cluster with markers
 */
interface Cluster {

  /**
  * the center (half of the distance between the top left and bottom right marker)
  */
  center: LatLng

  /**
  * the marker to calculate the distance
  */
  originMarker: Marker

  markers: Marker[]
}

/**
 * a marker pair with a marker and a quadtree node
 */
interface MarkerPair {
  marker: Marker
  x: number
  y: number
  index: number
  node: QuadTreeNode
}

/**
 * a rectangular area
 */
interface ViewPort {
    topLeft: LatLng
    bottomRight: LatLng
}

/**
 * a quadtree node with 4 sub nodes a parent and markers and a level
 */
interface QuadTreeNode {
  parentNode: QuadTreeNode
  markers: MarkerPair[]
  level: number
  subNodes: QuadTreeNode[]
}


/**
 * the clusterer
 */
class Clusterer {

  static delay = 3000
  static drawrCrosses = false
  static drawSector = false

  static drawClusterOrigin = true
  static map: GeoMap = null

  //max distance between 2 marker where the 2 markers still belong to the same cluster
  // distance < maxDistanceForCluster -> same cluster
  /**
  * the max distance a other marker can be distant from the initial cluster marker
  * in order to be added to the same cluster
  */
  static maxDistanceForCluster = 100

    /**
     * returns a list of clusters for the given markers
     * @param markers the markers to cluster with
     * @returns {Cluster[]} the built clusters
     */
  static getClusters(markers: Marker[]) : Cluster[] {

    var viewPort = Clusterer.getViewPort(markers)

    var pairs : MarkerPair[] = []
    for (let i = 0; i < markers.length; i++) {
        let marker = markers[i];
        let p = marker.getXY()
        pairs.push({
          marker: marker,
          x: p.x,
          y: p.y,
          index: i,
          node: null
        })
    }

    var root: QuadTreeNode = {
      parentNode: null,
      markers: [],
      level: 0,
      subNodes: []
    }

    Clusterer.createQuadTree(viewPort, pairs, root)

    var clusters = Clusterer.getClustersFromPairs(pairs)

    return clusters;
  }

    /**
     * gets a list of clusters for the given marker pairs
     * @param pairs all marker pairs to build clusters with
     * @returns {Cluster[]} the list of clusters
     */
  private static getClustersFromPairs(pairs: MarkerPair[]): Cluster[] {

    var clusters: Cluster[] = []
    //start building clusters by starting with the highest depth
    var sortedPairs = pairs.sort((a: MarkerPair, b: MarkerPair) => {
      return b.node.level - a.node.level
    })

    for (let i = 0; i < sortedPairs.length; i++) {
        sortedPairs[i].index = i;
    }

    for (let i = 0; i < sortedPairs.length; i++) {
        let pair = sortedPairs[i];

        if (pair === null) continue

        sortedPairs[i] = null

        //pair is the origin of this cluster

        if (Clusterer.map && Clusterer.drawClusterOrigin) {
          Clusterer.map.addMarkerFromGeoLocation(pair.marker.getLocation(), cross, true, null)
        }

        let cluster = Clusterer.getCluster(pair, sortedPairs)

        if (cluster) //when the cluster only would have 1 marker ... dont build a cluster
          clusters.push(cluster)
    }

    return clusters
  }

    /**
     * gets the cluster for the given pair
     * @param pair the pair to start clustering (searching for markers in near)
     * @param sortedPairs all marker pairs to search
     * @returns {any} the cluster
     */
  private static getCluster(pair: MarkerPair, sortedPairs: MarkerPair[]) : Cluster {

    var cluster: Cluster = {
      //node: null,
      center: null,
      originMarker: pair.marker,
      markers: [pair.marker]
    }
    //cluster.node = pair.node

    for (let i = 0; i < sortedPairs.length; i++) {
        let markerPair = sortedPairs[i];

        if (markerPair) {

          var distance = Clusterer.getDistance(pair, markerPair)

          if (distance < Clusterer.maxDistanceForCluster) {
            cluster.markers.push(markerPair.marker)
            sortedPairs[i] = null //only add the marker to one cluster
          }
        }
    }

    if (cluster.markers.length > 1) {

      let viewport = Clusterer.getViewPort(cluster.markers)
      let centerX = viewport.topLeft.lng + ((viewport.bottomRight.lng - viewport.topLeft.lng) / 2)
      let centerY = viewport.bottomRight.lat + ((viewport.topLeft.lat - viewport.bottomRight.lat) / 2)

      cluster.center = {
        lat: centerY,
        lng: centerX
      }

      return cluster
    }

    return null
  }

    /**
     * gets the distance in px between two marker(pairs)
     * @param p1 the first marker pair
     * @param p2 the second marker pair
     * @returns {number} the distance in px
     */
  private static getDistance(p1: MarkerPair, p2: MarkerPair) : number {

    var dx = Math.abs(p1.x - p2.x)
    var dy = Math.abs(p1.y - p2.y)
    var distance = Math.sqrt(
      (dx * dx) +
      (dy * dy)
    )

    return distance
  }

    /**
     * gets the rectangular area with the list of markers (top left most & bottom right most)
     * @param markers the markers
     * @returns {{topLeft: {lat: number, lng: number}, bottomRight: {lat: number, lng: number}}} the rectangular area
     */
  static getViewPort(markers: Marker[]) : ViewPort {

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

    /**
     * creates a quadtree recursively until every marker has its own quadtree node
     * @param viewport the start viewport
     * @param markersPairs the markers to divide
     * @param root the current quadtree root node
     */
  private static createQuadTree(viewport: ViewPort, markersPairs: MarkerPair[], root: QuadTreeNode) {

    var self = this

    root.markers = []

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

    //console.log("lng: " + centerX + " lat: " + centerY)

    //if (drawrCrosses) {
      //var mk = map.addMarkerFromGeoLocation({lat: centerY, lng: centerX}, cross, true, null)
      //var point = mk.getXY()
      //console.log(point)
    //}


    for (let i = 0; i < markersPairs.length; i++) {
        let pair = markersPairs[i];

        let location = pair.marker.getLocation()

        if (location.lat > centerY) { //top side
          if (location.lng <= centerX) { //left side
              child0.markers.push(pair)
          } else { //location.lng > centerY //right side
              child0.markers.push(pair)
          }

        } else { //location.lat <= centerX //bottom side
          if (location.lng <= centerX) { //left side
              child2.markers.push(pair)
          } else { //location.lng > centerY //right side
            child3.markers.push(pair)
          }
        }
    }

    //next level
      //we want 1 marker in 1 node so keep goging until its 1
    if (child0.markers.length > 1) { //top left

      let subViewPort: ViewPort = {
        topLeft: viewport.topLeft,
        bottomRight: {
          lat: centerY,
          lng: centerX
        }
      }

      self.createQuadTree(subViewPort, child0.markers, child0)

    } else if (child0.markers.length == 1) {
      //now we only have 1 marker so stop recursion
      //and add the related node to the marker
      child0.markers[0].node = child0
    }

      //we want 1 marker in 1 node so keep goging until its 1
    if (child1.markers.length > 1) { //top right

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

      self.createQuadTree(subViewPort, child1.markers, child1)

    } else if (child1.markers.length == 1) {
      //now we only have 1 marker so stop recursion
      //and add the related node to the marker
      child1.markers[0].node = child1
    }


      //we want 1 marker in 1 node so keep goging until its 1
    if (child2.markers.length > 1) { //bottom left

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

      self.createQuadTree(subViewPort, child2.markers, child2)

    } else if (child2.markers.length == 1) {
      //now we only have 1 marker so stop recursion
      //and add the related node to the marker
      child2.markers[0].node = child2
    }

    //we want 1 marker in 1 node so keep goging until its 1
    if (child3.markers.length >  1) { //bottom right

      let subViewPort: ViewPort = {
        topLeft: {
          lat: centerY,
          lng: centerX
        },
        bottomRight: viewport.bottomRight
      }

      self.createQuadTree(subViewPort, child3.markers, child3)

    } else if(child3.markers.length == 1) {
      //now we only have 1 marker so stop recursion
      //and add the related node to the marker
      child3.markers[0].node = child3
    }
  }

}
