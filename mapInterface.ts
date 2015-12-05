//autor janis dähne

/*
* represents a pair of x y coordinates
*/
interface Point {

  /*
  * the y coordinate
  */
    x: number;

    /*
    * the y coordinate
    */
    y: number;
}

/**
 * a geo location
 */
interface LatLng {

    /**
     * the latitude
     */
    lat: number;

    /**
     * the longitude
     */
    lng: number;
}

/**
* an interface for a serialized marker (for export)
*/
interface SerializedMarker {

    /**
    * the visibility of this marker
    */
    visibility: boolean

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
}


/**
 * a marker with some data and a geo location
 */
interface Marker {

    /**
    * a id for this marker
    */
    //id: number;

    /**
    * the visibility of this marker
    */
    //visibility: boolean

    /*
    * the icon
    */
    //iconPath: string;

    /**
     * the geo location information for the marker
     */
    //location: LatLng;

    /**
     * some user data
     */
    data: any;

    /**
    * the geo map for this marker
    */
    //map: GeoMap;


    /* ---------- functions ------------ */

    /**
    * gets the id of this marker
    */
    getId() : number;

    /**
    * gets the geo map
    */
    getMap() : GeoMap;

    /**
    * deletes the marker from the map
    */
    delete(): boolean;

    /*
    * gets the icon path for this marker
    */
    getIconPath(): string;

    /**
    * sets the icon for this marker
    */
    setIconPath(iconPath: string): void;

    /**
    * sets the visibility for this marker
    * @param visible true: visible, false: not visible
    */
    setVisibility(visible: boolean): void;

    /**
    * gets the current visibility of this marker (true: visible, false: not visible)
    */
    getVisibility(): boolean;

    /**
    * sets the location for this marker
    * @param location the new location
    */
    setLocation(location: LatLng) : void;

    /*
    * gets the current location of this marker
    */
    getLocation() : LatLng;

    /**
    * gets the position of this marker on its map
    */
    getXY(): Point

    /**
    * serializes this marker
    */
    toSerializedMarker(): SerializedMarker;


}

/**
* a event token to store the event
*/
interface EventToken {

    /**
    * the event id for this event listener
    */
    id: number

    /**
    * the event name
    */
    eventName: string

    /**
    * null or some vendor specific token
    */
    token: any

    /**
    * the corresponding geo map
    */
    map: GeoMap
}

/**
 * an interface for a geo map (do not use the map until pre_init and init was called!)
 */
interface GeoMap {

    /**
     * the parent element that hosts the map
     */
    parentElement: HTMLElement;

    /**
    * call this to maybe load som vendor specific scripts (google maps) or sth
    */
    pre_init(callback: () => void): void;

    /**
     * inits the map (normally called once)
     */
    init(element: HTMLElement, center: LatLng, zoom: number): void;

    /**
     * insers the map to the dom of the html document
     */
    displayMap(): void;

    /**
     * hides the map
     */
    hideMap(): void;

    /**
     * remove the map from the dom of the html document | new: removes the content of the maps parent element
     */
    deleteMap(): void;

    /**
     * returns true: map is hidde, false: map is not hidden or removed
     */
    isMapDisplayed(): boolean;

    /**
     * returns true: map is fully removed (from dom and all variables), false: not
     */
    isMapDeleted(): boolean;

    /**
     * returns true: map is already initialized, false: not
     */
    isMapInitialized(): boolean;

    /**
     * sets the new zoom of/for the map
     * @param newZoom the new zoom
     */
    setZoom(newZoom: number): void;

    /**
     * returns the current zoom
     */
    getZoom(): number;

    /**
     * sets the center of the map
     * @param lat the latitude
     * @param lng the longitude
     */
    setCenter(lat: number, lng: number): void;

    /**
     * returns the current center as a geo location
     */
    getCenter(): LatLng;

    /**
     * adds a listener for the specified event
     * @param eventName the name of the event
     * @param marker the marker to attach the event to
     * @param func the function to execute when the events occurs
     * @return the event token
     */
    addMarkerListener(eventName: string, marker: Marker, func: (marker: Marker,  ...originalArgs: any[]) => void): EventToken;

    /**
     * removes the listener from the marker
     * @param marker the marker with the given event token
     * @param token the event token
     */
    removeMarkerListener(marker: Marker, token: EventToken): void;


    /**
     * adds a listener for map for the specified event
     * @param eventName the name of the event
     * @param func the function to execute when the events occurs
     * @return the event token
     */
    addMapListener(eventName: string, func: (...originalArgs: any[]) => void): EventToken;

    /**
     * removes the listener from the map
     * @param token the event token
     */
    removeMapListener(token: EventToken): void;


    /**
     * returns a marker for the given geoLocation
     * @param geoLocation the geo location
     * @param iconPath the path for the marker icon
     * @param displayOnMap true: draw the marker on the map, false: not
     * @param data the data to store in the created marker
     * @return the added marker or null (if something went wrong)
     */
    addMarkerFromGeoLocation(Location: LatLng,  iconPath: string, displayOnMap: boolean, data: any): Marker;

    /**
     * adds a marker to the map (marker must have no id)
     * @param marker the marker to add
     * @param displayOnMap true: draw the marker on the map, false: not
     * @return the added marker or null (if the id was already hold by another marker! or something other went wrong)
     */
    addMarker(marker: Marker, displayOnMap: boolean): Marker;

    /**
     * removes the marker from the map (if possible)
     * @param marker the marker to remove
     * @return the removed marker or null (the marker was not on this map)
     */
    removeMarker(marker: Marker): Marker;

    /**
    * removes the marker with the given id (if possible)
    * @param markerId the marker id
    * @return the removed marker or null (the marker was not on this map)
    */
    removeMarkerById(markerId: number): Marker;

    /*
    * gets the x y coordinates of the marker (relative the the drawing surface)
    */
    getMarkerXY(marker: Marker): Point;

    /*
    * gets the x y coodinates of the geo location on this map (relative the the drawing surface)
    */
    getXYFromGeoLocation(location: LatLng): Point;

    /**
    * gets the geo location from the given point
    * @param point the x,y pair to get the geo location from
    * @return the geo location for the point
    */
    getGeoLocationFromXY(point: Point) : LatLng
    /*
    * returns all markers on this map
    */
    getAllMarkers(): Array<Marker>;

}
