/// <reference path="./mapInterface.ts"/>

// selectionOverlayDiv requirements: should be:
// in the same div as the map host div e.g.
/*
  <div id='mapHostDiv' style='position: relative'> <!-- relative in oder to let the absolute positioning from the selection overlay div to work -->

  <!-- mybe you need to add style="height: 100%; width:100%; to force the overlay to stretch (and parent element fixed height/size) -->
    <div id='overlayDiv' style='position: absolute;display: inline;opacity: 0.5; background: aliceblue;'>
    </div>

    <div id='mapCanvasDiv'></div> <!-- map will be displayed in this canvas-->
  </div>
*/

//to reposition the map and overlay use the mapHostDiv (recommended)
// the selectionOverlayDiv must directly cover the map div that the calculations work...

//TODO maybe remove the notSelected Markers for performace improvements and use onSelectionStartedFunc & onEndSelectionFunc
//but then we need to rewrite the muti selection

/**
 * a helper for selection on a map (with the help of a overlay div)
 * multi select markers via holding shift while selecting
 */
class MapSelectionHelper {

  /**
   * the overlay z index that will be set in coodinates
   * the indicator div will have overlayZIndex + 1
   * @type {number}
   */
  private static overlayZIndex = 10

  /**
   * the map to work with
   * @type {GeoMap}
   */
  private static map: GeoMap = null

  /**
   * the over lay div
   * @type {HTMLDivElement}
   */
  private static selectionOverlayDiv: HTMLDivElement = null

  /**
   * true: display the overlay and allow selection, false: dont
   * @type {boolean}
   */
  private static isSelectionModeEnabled: boolean = false

  /**
   * the last down position (x,y) relative to the overlay div
   * @type {Point} that is {x: number, y: number}
   */
  private static lastDownPoint: Point = null

  /**
   * the last down geo location
   * @type {LatLng} that is {lat: number, lng: number}
   */
  private static lastDownGeoLocation : LatLng = null

  /**
   * always the top left geo location (if any, always present on a selection operation)
   * @type {LatLng} that is {lat: number, lng: number}
   */
  private static topLeftGeoLocation: LatLng = null

  /**
   * always the bottom right geo location (if any, always present on a selection operation)
   * @type {LatLng} that is {lat: number, lng: number}
   */
  private static bottomRightGeoLocation: LatLng = null

  /**
   * the indicator div that displays the selected area
   * @type {HTMLDivElement}
   */
  private static indicatorDiv: HTMLDivElement = null


  /**
   * the function to call when the selection is started (on mouse down)
   * (this is called for every selection so multi selection with shift will fire this multiple times)
   */
  private static onSelectionStartedFunc: () => void

  /**
   * the function to call when the selection chaned (on every mousemove event)
   * @type {null}
   */
  public static onSelectionChangedFunc: (selectedMarkers: Marker[], notSelectedMarkers: Marker[]) => void = null

  /**
   * called when the selection ends (when the mouseup event is processed)
   * (this is called for every selection so multi selection with shift will fire this multiple times)
   * @type {null}
   */
  public static onEndSelectionFunc: (selectedMarkers: Marker[], notSelectedMarkers: Marker[]) => void = null


  /**
   * joined shoud be the same as map.getAllMarkers
   * the last selected markers in oder to call the onEndSelectionFunc function
   * @type {Array}
   */
  private static lastSelectedMarkers: Marker[] = []

  /**
   * the last not selected markers in oder to call the onEndSelectionFunc function
   * @type {Array}
   */
  private static lastNotSelectedMarkers: Marker[] = []


  /**
   * call this func to set up the selection helper (old listeners etc. are not cleared this is a TODO)
   * @param map the map to enable selection
   * @param selectionOverlayDiv the overlay div to display over the map to enable selection
   * @param selectionChangedFunc the function to call on every mouse move when there is a selection going on
   * @param selectionEndedFunc the function to call when the selection ended (mouse up)
   * @param selectionStarted the function to call when the selection started (mouse down) (last because most of the time omitted)
   * @constructor
   */
  public static Init(map: GeoMap, selectionOverlayDiv: HTMLDivElement,
    selectionChangedFunc: (selectedMarkers: Marker[], notSelectedMarkers: Marker[]) => void,
    selectionEndedFunc?: (selectedMarkers: Marker[], notSelectedMarkers: Marker[]) => void,
    selectionStarted?: () => void //last param because most of the time left out
    ) {

    this.map = map;
    this.selectionOverlayDiv = selectionOverlayDiv

    this.selectionOverlayDiv.style.zIndex = this.overlayZIndex + ''
    this.selectionOverlayDiv.style.display = 'none'

    this.onSelectionChangedFunc = selectionChangedFunc
    this.onEndSelectionFunc = selectionEndedFunc
    this.onSelectionStartedFunc = selectionStarted

    //set up all events
    this.init_afert()
  }

  /**
   * set up listeners
   */
  private static init_afert() {

    this.selectionOverlayDiv.addEventListener('mousedown', (ev: MouseEvent) => {

      if (!this.isSelectionModeEnabled) return

      this.lastDownPoint = this.translateToRelative({
        x: ev.x,
        y: ev.y
      })

      this.lastDownGeoLocation = this.map.getGeoLocationFromXY(this.lastDownPoint)

      //set the start position of the indicator div
      this.setIndicatorPosition(this.lastDownPoint.x, this.lastDownPoint.y)

      if (this.onSelectionStartedFunc)
        this.onSelectionStartedFunc()
    })

    this.selectionOverlayDiv.addEventListener('mousemove', (ev: MouseEvent) => {

      if (!this.isSelectionModeEnabled) return

      //check if there is really a selection going on...
      if (this.lastDownPoint) {
        this.indicatorDiv.style.display = 'inline'

        //if we select from left top to right bottom all ok

        //but when we select from (bottom) right to (top) left then we need to change the offset too

        //x direction: 0 -> 100
        //y direction:
        // 0
        // 100

        let eventPoint = this.translateToRelative({x: ev.x, y: ev.y})


        if (this.lastDownPoint.x <= eventPoint.x) {
           //left to right selection

          if (this.lastDownPoint.y <= eventPoint.y) {
            // top to bottom selection (drag bottom right)

            //lastDownPoint is top left

            //all ok normal top left to bottom right selection
            let bottomRightPoint = {
              x: eventPoint.x,
              y: eventPoint.y
            }
            this.topLeftGeoLocation = this.map.getGeoLocationFromXY(this.lastDownPoint)
            this.bottomRightGeoLocation = this.map.getGeoLocationFromXY(bottomRightPoint)

            //change width and height
            this.setIndicatorPosition(
              this.lastDownPoint.x, //left
              this.lastDownPoint.y, //top
              bottomRightPoint.x - this.lastDownPoint.x, //width
              bottomRightPoint.y - this.lastDownPoint.y //height
            )

          } else {
            // bottom to top selection (drag top right)

            //lastDownPoint is bottom left

            let topRightPoint = {
              x: eventPoint.x,
              y: eventPoint.y
            }

            let tempBottomLeftGeoLocation = this.map.getGeoLocationFromXY(this.lastDownPoint) //down point is bottom left one
            let tempTopRightGeoLocation = this.map.getGeoLocationFromXY(topRightPoint) //drag point is top right one


            this.topLeftGeoLocation = {
                lat: tempTopRightGeoLocation.lat, //y from top
                lng: tempBottomLeftGeoLocation.lng //x from bottom left
            }

            this.bottomRightGeoLocation = {
              lat: tempBottomLeftGeoLocation.lat, //y from bottom
              lng: tempTopRightGeoLocation.lng //x from right
            }

            //only starting x is ok
            //change width, height and top
            this.setIndicatorPosition(
              this.lastDownPoint.x, //left
              this.lastDownPoint.y - (this.lastDownPoint.y - topRightPoint.y), //top
              topRightPoint.x -this.lastDownPoint.x, //width
              this.lastDownPoint.y - topRightPoint.y //height
            )

          }

        } else {
          //right to left selection

          if (this.lastDownPoint.y <= eventPoint.y) {
            // top to bottom selection (drag to bottom left)

            //lastDownPoint is top right
            let bottomLeftPoint = {
              x: eventPoint.x,
              y: eventPoint.y
            }

            let tempTopRightGeoLocation = this.map.getGeoLocationFromXY(this.lastDownPoint)
            let tempBottomLeftGeoLocation = this.map.getGeoLocationFromXY(bottomLeftPoint)

            this.topLeftGeoLocation = {
              lat: tempTopRightGeoLocation.lat, //y
              lng: tempBottomLeftGeoLocation.lng //x
            }

            this.bottomRightGeoLocation = {
              lat: tempBottomLeftGeoLocation.lat,
              lng: tempTopRightGeoLocation.lng
            }

            //change left, width and height
            this.setIndicatorPosition(
              bottomLeftPoint.x,  //left
              this.lastDownPoint.y, //top
              this.lastDownPoint.x - bottomLeftPoint.x, //width
              bottomLeftPoint.y - this.lastDownPoint.y //height
            )

          } else {
            // bottom to top selection (drag top left)

            //lastDownPoint is bottom right

            let TopLeftPoint = {
              x: eventPoint.x,
              y: eventPoint.y
            }

            let tempBottomRightGeoLocation = this.map.getGeoLocationFromXY(this.lastDownPoint)
            let tempTopLeftGeoLocation = this.map.getGeoLocationFromXY(TopLeftPoint)

            this.topLeftGeoLocation = {
              lat: tempTopLeftGeoLocation.lat, //y
              lng: tempTopLeftGeoLocation.lng //x
            }

            this.bottomRightGeoLocation = {
              lat: tempBottomRightGeoLocation.lat,
              lng: tempBottomRightGeoLocation.lng
            }

            //change top, left, width and height
            this.setIndicatorPosition(
              TopLeftPoint.x,  //left
              TopLeftPoint.y, //top
              this.lastDownPoint.x - TopLeftPoint.x, //width
              this.lastDownPoint.y - TopLeftPoint.y //height
            )
          }
        }

        //console.log(ev.x + " y: " + ev.y)
        //check and fire event
        this.checkSelectionChanged(ev.shiftKey)
      }
    })

    this.selectionOverlayDiv.addEventListener('mouseup', (ev: MouseEvent) => {

      if (!this.isSelectionModeEnabled) return

      this.lastDownPoint  = null
      this.topLeftGeoLocation = null
      this.indicatorDiv.style.display = 'none'
      this.indicatorDiv.style.width = "1px"
      this.indicatorDiv.style.height = "1px"

      if (this.onEndSelectionFunc)
        this.onEndSelectionFunc(this.lastSelectedMarkers, this.lastNotSelectedMarkers)
    })


    //creat the div to display the selection area
    this.createSelectionIndicatorDiv()
  }

  /**
   * checks all markers on the map if they are located in the selected are and fires the selection change event
   */
  private static checkSelectionChanged(isShiftUsed: boolean) {

    let topLeft = {
      lat: this.topLeftGeoLocation.lat,
      lng:  this.topLeftGeoLocation.lng
    }
    let bottomRight = {
      lat: this.bottomRightGeoLocation.lat,
      lng: this.bottomRightGeoLocation.lng,
    }

    let allmarkers = this.map.getAllMarkers()
    let selectedMarkers = []
    let notSelectedMarkers = []

    if (!isShiftUsed) {
      for (let i = 0; i < allmarkers.length; i++) {
          let m = allmarkers[i];

          //check if the marker is in the selected area
          if (m.getLocation().lat < topLeft.lat && bottomRight.lat < m.getLocation().lat) { //check lat (breitengrad y)

            if (m.getLocation().lng < bottomRight.lng && topLeft.lng < m.getLocation().lng) { //check lng (laengengrad x)
              selectedMarkers.push(m)
              continue
            }
          }
          notSelectedMarkers.push(m)
      }
    } else {
      //shift is used so continue selection and dont clear
      selectedMarkers = this.lastSelectedMarkers

      for (let i = 0; i < this.lastNotSelectedMarkers.length; i++) {
          let m2 = this.lastNotSelectedMarkers[i];
          //check if the marker is in the selected area
          if (m2.getLocation().lat < topLeft.lat && bottomRight.lat < m2.getLocation().lat) { //check lat (breitengrad y)

            if (m2.getLocation().lng < bottomRight.lng && topLeft.lng < m2.getLocation().lng) { //check lng (laengengrad x)
              selectedMarkers.push(m2)
              continue
            }
          }
          notSelectedMarkers.push(m2)
      }
    }


    this.lastSelectedMarkers = selectedMarkers
    this.lastNotSelectedMarkers = notSelectedMarkers

    //fire event with selected markers
    this.onSelectionChangedFunc(this.lastSelectedMarkers, this.lastNotSelectedMarkers)
  }

  /**
   * enables (displays overlay) selection or disables selection hides the overlay
   * @param enableSelection true: enables (displays overlay) the selection or false: disables selection hides the overlay
   */
  public static setSelectionMode(enableSelection: boolean) {
    this.isSelectionModeEnabled = enableSelection

    if (this.isSelectionModeEnabled) {
      this.selectionOverlayDiv.style.display = 'inline'
    } else {
      this.selectionOverlayDiv.style.display = 'none'
    }
  }


  /**
   * sets the indicator position and site new
   * @param left null (no effect) or the style left property
   * @param top null (no effect) or the style top property
   * @param width null (no effect) or the style width property
   * @param height null (no effect) or the style height property
   */
  private static setIndicatorPosition(left?: number, top?: number, width?: number, height?: number) {

    if (left) {
      this.indicatorDiv.style.left = left + 'px'
    }

    if (top) {
      this.indicatorDiv.style.top = top+ 'px'
    }

    if (width) {
      this.indicatorDiv.style.width = width + 'px'
    }

    if (height) {
      this.indicatorDiv.style.height = height + 'px'
    }
  }

  /**
   * creates the indicator div and adds it to the overlay div (normally called only once when initing the selection helper)
   */
  private static createSelectionIndicatorDiv() {

    let indicator: HTMLDivElement = document.createElement('div')
    indicator.style.position = 'absolute'
    indicator.style.opacity = '0.3'
    indicator.style.background = 'red'
    indicator.style.zIndex = (this.overlayZIndex + 1) + ''
    indicator.style.display = 'none' //at start

    this.indicatorDiv = indicator

    this.selectionOverlayDiv.appendChild(this.indicatorDiv)
  }


  /**
   * translate absolute coordinates from the events to relative coodinates (relative to the overlay div)
   * @param point the point to translate
   * @returns {Point} the translated point
   */
  private static translateToRelative(point: Point): Point {

    //console.log(point)

    let off = this.getElementPosition(this.selectionOverlayDiv)
    let offX = off.left // this.selectionOverlayDiv.offsetLeft
    let offY = off.top // this.selectionOverlayDiv.offsetTop

    let translatedPoint: Point = {
      x: point.x - offX,
      y: point.y - offY
    }

    //console.log(translatedPoint)

    return translatedPoint
  }

  //from https://www.webmasterworld.com/javascript/4068616.htm
  /**
   * calculates the offset for the given element
   * @param el the element
   * @returns {{left: number, top: number}}
   */
  private static getElementPosition(el) {
    var l = 0, t = 0;
    while (el.offsetParent) {
      l += el.offsetLeft;
      t += el.offsetTop;
      el = el.offsetParent;
    }
    return {left:l, top:t};
  }

}
