/**
 * @typedef {{[key: string]: any}} Dict
 */

/**
 * @typedef {(...args: any[]) => any} Callable
 */

/**
 * @typedef {Object} GeoJSON
 * @property {string} type - "FeatureCollection" or "Feature"
 * @property {string} name - Data name
 * @property {Object} crs - Coordinates system: {"type": "value", "properties": {"name": "value"}}
 * @property {Array<Feature>} features Array of features
 * /

/**
 * @typedef {Object} Feature
 * @property {string} type - "Feature"
 * @property {Object<string, string | number>} properties - User defined properties
 * @property {Object} geometry - {"type":"Polygon" or "MultiPolygon","coordinates": [[[x,y], [x,y]...]]
*/

/**
 * @typedef {Object} LatLng
 * @property {string} lat 
 * @property {string} lng 
 */

/**
 * @typedef {Object} Pixel
 * @property {number} x 
 * @property {number} y 
 */

/**
 * @typedef {Object} Bounds
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} Marker
 * @property {HTMLElement} content
 */

/**
 * @typedef {Object} UIColor
 * @property {string} back
 * @property {string} font
 * @property {string} border
 */

/**
 * @typedef {Object} TextColor
 * @property {string} back
 * @property {string} font
 */

/**
 * @typedef {Object} Color
 * @property {string} back
 * @property {string} fore
 */

/**
* @typedef {Object} PinColor
* @property {string} background
* @property {string} border
* @property {string} glyph
* @property {string} hoverBackground
* @property {string} hoverBorder
* @property {string} hoverGlyph
*/

/**
* @typedef {Object} PolygonColor
* @property {string} stroke
* @property {string} fill
*/

export { };