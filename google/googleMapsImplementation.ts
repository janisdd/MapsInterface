//autor janis dähne

///<reference path="../mapInterface.ts"/>
///<reference path="google.maps.d.ts"/>


/*
* some events a marker can listen for (many can also be used for the map too! e.g. mouse...)
* see https://developers.google.com/maps/documentation/javascript/reference#Marker for all events
*/
class GoogleMapsEventNames {

    static animation_changed = "animation_changed"
    static click = "click"
    static clickable_changed = "clickable_changed"
    static cursor_changed = "cursor_changed"
    //doubleclick
    static dblclick = "dblclick"
    static drag = "drag"
    static dragend = "dragend"
    static draggable_changed = "draggable_changed"
    static dragstart = "dragstart"
    static flat_changed = "flat_changed"
    static icon_changed = "icon_changed"
    static mousedown = "mousedown"
    static mouseout = "mouseout"
    static mouseover = "mouseover"
    static mouseup = "mouseup"
    static position_changed = "position_changed"
    static rightclick = "rightclick"
    static shape_changed = "shape_changed"
    static title_changed = "title_changed"
    static visible_changed = "visible_changed"
    static zindex_changed = "zindex_changed"
}


/**
 * stores the marker data and google specific data
 */
class GoogleMapsMarker implements Marker {

  /**
  * the visibility of this marker
  */
  visibility: boolean

  /**
  * a id for this marker
  */
  id: number;

  /**
  * the geo map for this marker
  */
  map: GeoMap;

  /*
  * the icon
  */
  iconPath: string;

  /**
   * the geo location information for the marker
   */
  location: LatLng;

  /**
   * some user data
   */
  data: any;

  /**
  * the real google maps marker
  */
  googleMarker:  google.maps.Marker;

  /* ---------- functions ------------ */


  /**
  * gets the id of this marker
  */
  getId() : number {
    return this.id;
  }

  /**
  * gets the geo map
  */
  getMap() : GeoMap {
    return this.map;
  }

  /**
  * returns a serialize version of this marker
  */
  toSerializedMarker(): SerializedMarker {
    return {
      visibility: this.visibility,
      iconPath: this.iconPath,
      location: this.location,
      data: this.data
    };
  }

  /**
  * deletes the marker from the map
  * @return true: marker was removed from the map, false: not
  */
  delete(): boolean {
    //returns the marker if removed else null
    this.googleMarker.setMap(null)
    return true
  }


  /*
  * gets the icon path for this marker
  */
  getIconPath(): string {
    return this.iconPath;
  }

  /**
  * sets the icon for this marker
  */
  setIconPath(iconPath: string): void {

    this.iconPath = iconPath;
    this.googleMarker.setIcon(iconPath);
  }

  /**
  * sets the visibility for this marker
  * @param {boolean} visible true: visible, false: not visible
  */
  setVisibility(visible: boolean): void {

    this.visibility = visible;
    this.googleMarker.setVisible(visible);
  }

  /**
  * @return {boolean} gets the current visibility of this marker (true: visible, false: not visible)
  */
  getVisibility(): boolean {
    return this.visibility;
  }

  /**
  * gets the position of this marker on its map
  */
  getXY(): Point {
    return  this.map.getMarkerXY(this);
  }

  /**
  * sets the location for this marker
  * @param location the new location
  */
  setLocation(location: LatLng) {
    this.googleMarker.setPosition(new google.maps.LatLng(location.lat, location.lng));
    this.location = location;
  }

  /*
  * gets the current location of this marker
  */
  getLocation() : LatLng {
    return this.location;
  }

}


/**
 * the GeoMap implementation for google maps
 */
class GoogleMapsMap implements GeoMap {

  /**
  * a simple counter for the ids
  */
  private counter: number = 0;

  /**
  * a simple counter for the event ids
  */
  private eventCounter: number = 0;

  /**
   * the parent element that hosts the map
   */
  public parentElement: HTMLElement;

  /**
   * the google maps map
   */
  public map: google.maps.Map = null;

  //private markers: GoogleMapsPair[] = [];

  //use _ + id as object key to maybe later access the marker through markers._xxx
  private markers: any = {};

  //private eventTokens: EventToken[] = [];

  //use _ + id as object key
  //private eventTokens: any = {};

  private isDisplayed: boolean = false;

  private isDeleted: boolean = false;

  private isInitialized: boolean = false;


  private overlay: google.maps.OverlayView;


  /**
   * google api script sould be already included and loaded in the html head element
   */
  pre_init(callback: () => void) {

    //callback();
    //return;

    if (window['googleMapsInitialize_$']) { //only include script once
      callback();
      return
    }

    var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.23&signed_in=true&libraries=drawing' + //exp
            '&signed_in=true&callback=googleMapsInitialize_$'; //we need a function googleMapsInitialize for the callback


        window['googleMapsInitialize_$'] = function () {
            console.log('inited')
            callback();
        }
            document.body.appendChild(script);


  }

  /**
   * creates the google maps map
   */
  init(element: HTMLElement, center: LatLng, zoom: number = 16) {

    this.markers = [];
    //this.eventTokens = [];
    this.parentElement = element;

    this.map = new google.maps.Map(this.parentElement, {
      zoom: zoom,
      center: new google.maps.LatLng(center.lat,center.lng)
    });

    this.isDisplayed = true;
    this.isInitialized = true;

    //to get the pixel coordinates from a lat lng ...
    //from http://stackoverflow.com/questions/2674392/how-to-access-google-maps-api-v3-markers-div-and-its-pixel-position/6671206#6671206
    //drawing canvas shoul be initialized
    var overlay = new google.maps.OverlayView();
    overlay.draw = function() {};
    overlay.setMap(this.map);

    this.overlay = overlay
  }

  /**
   * insers the map to the dom of the html document
   */
  displayMap(): void {
    this.parentElement.style.display = "";
    this.isDisplayed = true;
  }

  /**
   * hides the map
   */
  hideMap(): void {
    this.parentElement.style.display = "none";
    this.isDisplayed = false;
  }

  /**
   * remove the map from the dom of the html document (löscht auch alle gesetzten styles)
   */
  deleteMap(): void {
      this.parentElement.innerHTML = "";
      this.parentElement.removeAttribute("style")
      this.map = null;
      this.markers = {};
      //this.eventTokens = [];
      this.isDeleted = true;
      this.isDisplayed = false;
      this.isInitialized = false;
  }

  /**
   * sets the new zoom of/for the map
   * @param newZoom the new zoom
   */
  setZoom(newZoom: number): void {
      this.map.setZoom(newZoom);
  }

  /**
   * returns the current zoom
   */
  getZoom(): number {

    return this.map.getZoom();
  }

  /**
   * sets the center of the map
   * @param lat the latitude
   * @param lng the longitude
   */
  setCenter(lat: number, lng: number): void {

    this.map.setCenter(new google.maps.LatLng(lat, lng));
  }

  /**
   * returns the current center as a geo location
   */
  getCenter() : LatLng {

    var latlng = this.map.getCenter();

    return {lat: latlng.lat(), lng: latlng.lng()};
  }

  /**
   * returns true: map is hidde, false: map is not hidden or removed
   */
  isMapDisplayed(): boolean {

    return this.isDisplayed;
  }

  /**
   * returns true: map is fully removed (from dom and all variables), false: not
   */
  isMapDeleted(): boolean {

    return this.isDeleted;
  }

  /**
   * returns true: map is already initialized, false: not
   */
  isMapInitialized(): boolean {

    return this.isInitialized;
  }

  //see events https://developers.google.com/maps/documentation/javascript/events
  //see example https://developers.google.com/maps/documentation/javascript/examples/event-simple
  //see marker docs https://developers.google.com/maps/documentation/javascript/reference#Marker
  /**
   * adds a listener for the specified event
   * @param eventName the name of the event
   * @param func the function to execute when the events occurs
   */
  addMarkerListener(eventName: string, marker: GoogleMapsMarker,  func: (marker: GoogleMapsMarker, ...originalArgs: any[]) => void): EventToken {

    var token: google.maps.MapsEventListener = marker.googleMarker.addListener(eventName, (...args: any[]) => {
      func(marker, args);
    });

    google.maps.event.addListener

    var listenerToken = {
        id: this.getNewEventId(),
        map: this,
        token: token,
        eventName: eventName
    }
    return listenerToken;
  }

  /**
   * removes the listener from the map
   * @param marker the marker with the given event token
   * @param listener the event name
   */
  removeMarkerListener(marker: GoogleMapsMarker, token: EventToken): void {
    google.maps.event.removeListener(token.token);
  }

  /**
   * adds a listener for map for the specified event
   * @param eventName the name of the event
   * @param func the function to execute when the events occurs
   * @return the event token
   */
  addMapListener(eventName: string, func: (...originalArgs: any[]) => void): EventToken {

    var token = google.maps.event.addListener(this.map, eventName, (event?: any, ...args: any[]) => {
      func(event, args);
    });

    var listenerToken = {
        id: this.getNewEventId(),
        map: this,
        token: token,
        eventName: eventName
    }

    return listenerToken;
  }

  /**
   * removes the listener from the map
   * @param token the event token
   */
  removeMapListener(token: EventToken): void {
    google.maps.event.removeListener(token.token);
  }

  /**
   * returns a marker for the given geoLocation
   * @param geoLocation the geo location
   * @param iconPath the path for the marker icon
   * @param displayOnMap true: draw the marker on the map, false: not
   * @param data the data to store in the created marker
   * @return the added marker or null (if something went wrong)
   */
  addMarkerFromGeoLocation(location: LatLng,  iconPath: string = "", displayOnMap: boolean = true, data: any = null): GoogleMapsMarker {

    var googleMarker: google.maps.Marker =  new google.maps.Marker ({
        position: new google.maps.LatLng(location.lat, location.lng),
        map: this.map,
        visible: displayOnMap,
        icon: iconPath
      });

    var _marker: GoogleMapsMarker = new GoogleMapsMarker();
    _marker.map = this;
    _marker.googleMarker = googleMarker;
    _marker.visibility = displayOnMap;
    _marker.location = location;
    _marker.iconPath = iconPath;
    _marker.data = data;
    _marker.id = this.getNewId();


    this.markers['_' + _marker.id] = _marker; //store the marker

    return _marker;
  }

  /**
   * adds a marker to the map (marker must have no id)
   * @param marker the marker to add (only the following data will be used: location, iconPath, data)
   * @param displayOnMap true: draw the marker on the map, false: not
   * @return the added marker (creates a new marker so parameter marker and returned marker are not equal!)
   * or null (if the id was already hold by another marker! or something other went wrong)
   */
  addMarker(marker: GoogleMapsMarker, displayOnMap: boolean = true): GoogleMapsMarker {

    //check for valid marker
    if (marker.id !== undefined && marker.id !== null) {
        //check for duplicate
        if (this.markers['_' + marker.id] !== undefined)
          return null;
    }

    var _marker = this.addMarkerFromGeoLocation(
      marker.location, marker.getIconPath(), displayOnMap, marker.data
    );

    return _marker;
  }

  /**
   * removes the marker from the map (if possible)
   * @param marker the marker to remove
   * @param removeFromMap true: remove the marker from the map (visually), false: not
   * @return the removed marker (same like parameter marker) or null (if the marker was not on this map)
   */
  removeMarker(marker: GoogleMapsMarker, removeFromMap: boolean = true): GoogleMapsMarker {

    //check for valid marker
    if (marker.id === undefined || marker.id === null)
      return null;

    this.removeMarkerById(marker.id);

    //return the parameter marker
    return marker;
  }

  /**
  * removes the marker with the given id (if possible)
  * @param markerId the marker id
  * @return the removed marker or null (the marker was not on this map)
  */
  removeMarkerById(markerId: number): GoogleMapsMarker {

    var _marker: GoogleMapsMarker = this.markers['_' + markerId];

    //check for duplicate
    if (_marker === undefined)
      return null;

      _marker.delete();
      delete this.markers["_" + _marker.id]

      return _marker;
  }


  /*
  * returns all markers on this map
  */
  getAllMarkers(): Array<GoogleMapsMarker> {

    var markers = []

    for(var key in this.markers) {

      if (this.markers.hasOwnProperty(key)) {

        var marker = this.markers[key]
        markers.push(marker)
      }
    }

    return markers;
  }

  /*
  * gets the x y coordinates of the marker (relative the the drawing surface)
  */
  getMarkerXY(marker: GoogleMapsMarker): Point {
    return this.getXYFromGeoLocation(marker.location);
  }

  /*
  * gets the x y coodinates of the geo location on this map (relative the the drawing surface)
  */
  public getXYFromGeoLocation(location: LatLng): Point {

    var temp = this.overlay.getProjection().fromLatLngToContainerPixel(
      new google.maps.LatLng(location.lat, location.lng)
    );

    return {x: temp.x, y: temp.y};
  }

//from ttp://stackoverflow.com/questions/3723083/how-to-use-frompointtolatlng-on-google-maps-v3
    public getGeoLocationFromXY(point: Point) : LatLng {
      var ne = this.map.getBounds().getNorthEast();
      var sw = this.map.getBounds().getSouthWest();
      var projection = this.map.getProjection();
      var topRight = projection.fromLatLngToPoint(ne);
      var bottomLeft = projection.fromLatLngToPoint(sw);

      //var scale = Math.pow(2, map.getZoom());
      var scale = 1 << map.getZoom();
      var newLatlng = projection.fromPointToLatLng(new google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y));
      return {
        lat: newLatlng.lat(),
        lng: newLatlng.lng()
      }
    }


  //----------------helper functions-----------------

  /*
  * returns a new id
  */
  private getNewId(): number {
    return this.counter++;
  }

  private getNewEventId(): number {
    return this.eventCounter++;
  }


}
