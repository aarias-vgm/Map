// @ts-ignore
// @ts-ignore
import { MAPCENTER, DIANKEY, MAPID } from './constants.js';
import { Department, Municipality, Hospital, Key, Point, Area } from './classes.js';
import Tooltip from './tooltip.js';
import { Place } from './classes.js'
import { getRandomElement, getRandomNumber } from './utils.js';
import Button from './button.js';

/**
 * @typedef {import('./types.js').Marker} Marker
 * @typedef {import('./types.js').Color} Color
 * @typedef {import('./types.js').UIColor} UIColor
 * @typedef {import('./types.js').PinColor} PinColor
 * @typedef {import('./types.js').TextColor} TextColor
 * @typedef {import('./types.js').PolygonColor} PolygonColor
 */

export default class Map {

    static instance = null
    static polygonIndex = 0

    constructor() {
        if (!this.instance) {
            this.instance = this
        }

        this.map = undefined

        this.isZoom = false
        this.lastFeature = undefined

        return this.instance
    }

    async initialize() {
        (g => {
            // @ts-ignore
            var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n))
        })({
            key: DIANKEY,
            v: "weekly" // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
            // Add other bootstrap parameters as needed, using camel case.
        });

        // @ts-ignore
        const { Map } = await google.maps.importLibrary("maps");

        this.map = new Map(document.getElementById("map"), {
            zoom: 5.8,
            maxZoom: 20,
            minZoom: 2,
            // styles: MAPSTYLES,
            mapId: MAPID,
            disableDefaultUI: true,
            clickableIcons: false,
            zoomControl: true,
            cameraControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: true,
            rotateControl: false,
            fullscreenControl: true
        });

        this.map.setCenter(MAPCENTER)
    }

    /**
     * @param {Array<Point>} points 
     * @returns {Point}
     */
    getCentroid(points) {
        let lat = 0, lng = 0;

        points.forEach(point => {
            lat += point.lat;
            lng += point.lng;
        });

        return new Point(lat, lng)
    }

    /**
     * 
     * @param {string} tag 
     * @param {TextColor} color
     * @returns 
     */
    createTag(tag, color) {
        return `<span class="nowrap" style="display: inline-block; margin: 1px 1px; padding: 2px 3px; border-radius: 10px; background: ${color.back}; color: ${color.font}; font-size: 0.6rem;">${tag}</span>`
    }

    /**
     * @param {Array<Point>} points
     * @param {string} name
     */
    createPolygon(points, name = "") {

        /** @type {Array<PolygonColor>} */
        const colors = [
            { "stroke": "#0077FF", "fill": "#88C0FF" },
            { "stroke": "#00CCFF", "fill": "#88E8FF" },
            { "stroke": "#FF0066", "fill": "#FF2D82" },
            { "stroke": "#FF5B9E", "fill": "#FF88B9" },
            { "stroke": "#FFB6D5", "fill": "#FFE3F1" },
            { "stroke": "#00FFEE", "fill": "#B6FFFC" },
            { "stroke": "#4800FF", "fill": "#682DFF" },
            { "stroke": "#895BFF", "fill": "#A988FF" },
            { "stroke": "#CAB6FF", "fill": "#EAE3FF" },
            { "stroke": "#FF6A00", "fill": "#FFA05B" },
            { "stroke": "#FFD5B6", "fill": "#FFF0E3" },
            { "stroke": "#FFCC00", "fill": "#FFE588" },
            { "stroke": "#FFEEB6", "fill": "#FFF6E3" }
        ]

        // const color = getRandomElement(colors)
        const color = colors[Map.polygonIndex % colors.length]
        Map.polygonIndex++

        // @ts-ignore
        const polygon = new google.maps.Polygon({
            paths: points,
            strokeColor: color.stroke,
            strokeOpacity: 0.5,
            strokeWeight: 2,
            fillColor: color.fill,
            fillOpacity: 0.3,
            clickable: true,
            map:this.map
        });

        const polygonsParent = document.getElementById("polygons");

        /** @type {HTMLElement} */
        const polygonElement = document.createElement("div");

        polygonElement.innerHTML = `<span class="polygon-tag">${name}</span>`
        polygonElement.style.display = "block"
        polygonElement.style.position = "absolute"
        polygonElement.style.opacity = "0"
        polygonElement.style.color = "black"
        polygonElement.style.fontWeight = "bold"
        polygonElement.style.userSelect = "none"
        polygonElement.style.pointerEvents = "none"

        polygonsParent?.appendChild(polygonElement);

        // @ts-ignore
        google.maps.event.addListenerOnce(map, 'idle', function() {
            const panes = polygon.get('map').getDiv().parentNode;
            panes.appendChild(polygon.get('map').getDiv());
        });

        // @ts-ignore
        google.maps.event.addListener(polygon, "mouseover", (event) => {
            polygonElement.style.left = `${event.domEvent.x}px`
            polygonElement.style.top = `${event.domEvent.y}px`
            polygonElement.style.opacity = "1"
        });
        
        // @ts-ignore
        google.maps.event.addListener(polygon, "mouseout", (event) => {
            console.log("adios")
            polygonElement.style.opacity = "0"
        });
    }

    /**
     * 
     * @param {Place} element 
     * @param {string} elementType 
     * @param {string} faIcon 
     * @param {PinColor} pinColor 
     * @returns {Promise<Marker>}
     */
    async createMarker(element, elementType, faIcon, pinColor) {

        // @ts-ignore
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

        const icon = document.createElement("div");

        icon.innerHTML = `
            <div name="${element.name}" lat="${element.lat}" lng="${element.lng}">
                <i class="fa ${faIcon} fa-2xl"></i> 
            </div>
        `

        // @ts-ignore
        const pin = new PinElement({
            glyph: icon,
            background: pinColor.background,
            borderColor: pinColor.border,
            glyphColor: pinColor.glyph,
            scale: 1.3
        });

        // @ts-ignore
        const marker = new AdvancedMarkerElement({
            map: this.map,
            position: element.getLatLng(),
            content: pin.element,
            title: `${elementType}: ${element.name}`,
            zIndex: 100,
            draggable: false
        });


        marker.element.addEventListener("mouseenter", () => {
            marker.element.style.cursor = "pointer"
            pin.element.style.opacity = "0.9"
            pin.element.style.transform = "scale(1.2)";
            pin.element.style.transition = "all 0.2s ease-out";

            pin.background = pinColor.hoverBackground;
            pin.borderColor = pinColor.hoverBorder;
            pin.glyphColor = pinColor.hoverGlyph;
        });

        marker.element.addEventListener("mouseleave", () => {
            marker.element.style.cursor = "auto"
            pin.element.style.opacity = "1"
            pin.element.style.transform = "scale(1)";

            pin.background = pinColor.background;
            pin.borderColor = pinColor.border;
            pin.glyphColor = pinColor.glyph;

            setTimeout(() => {
                pin.element.style.transition = "none";
            }, 200)
        });

        return marker
    }

    /**
     * 
     * @param {Hospital} hospital 
     */
    async createHospitalMarker(hospital) {

        /** @type {PinColor} */
        const pinColor = { background: "#FFFFFF", border: "#DC143C", "glyph": "#DC143C", hoverBackground: "#F5F5F5", hoverBorder: "#c51236", hoverGlyph: "#c51236" }

        /** @type {UIColor} */
        const nameColor = { back: "#FFFFFF", font: "#DC143C", border: "#DC143C" }

        /** @type {UIColor} */
        const infoColor = { back: "#DC143C", font: "#FFFFFF", border: "#DC143C" }

        /** @type {TextColor} */
        const selectionColor = { back: "#ffffff", font: "#ad102f" }

        /** @type {Color} */
        const scrollColor = { back: "transparent", fore: "#ad102f" }

        /** @type {UIColor} */
        const pointColor = { back: "#ad102f", font: "#FFFFFF", border: "#ad102f" }

        /** @type {Array<TextColor>} */
        const tagColors = [
            { back: "#E8627D", font: "#FFFFFF" },
            { back: "#EE8A9E", font: "#FFFFFF" },
            { back: "#F3B1BE", font: "#000000" },
            { back: "#F9D8DF", font: "#000000" },
        ]

        const faIcon = "fa-heart-pulse"

        const marker = await this.createMarker(hospital, "Hospital", faIcon, pinColor)

        const nameHTML = `
            <div class="hospital" style="padding: 10px; border: 2px solid ${nameColor.border}; border-radius: 5px; background-color: ${nameColor.back}; color: ${nameColor.font};">
                <i class="fa ${faIcon}"></i>
                <span>${hospital.name}</span>
            </div>
        `

        let index = getRandomNumber(tagColors.length);

        const infoHTML = `
            <div class="hospital" style="padding: 10px; border: 2px solid ${infoColor.border}; border-radius: 5px; background-color: ${infoColor.back}; color: ${infoColor.font};">
                <div style="display: flex; flex-direction: row; justify-content: left; align-items: start;">
                    <div class="left" style="max-width: 125px; height: min-content;">
                        <h5 style="margin-bottom: 4px;">
                            <span style="display: inline-flex; white-space: nowrap;">
                                <i class="fa ${faIcon}" style="margin-right: 3px;"></i>
                                <span>${hospital.name.split(" ")[0]}</span>
                            </span>
                            <span>${hospital.name.split(" ").slice(1).join(" ")}</span>
                        </h5>
                        <em style="font-size: 0.75rem;">
                            <span>${hospital.municipality?.name}</span>
                            <span>(${hospital.municipality?.department?.name})</span>
                            <span class="point-icon" style="position: relative; margin-left: 2px; color: ${infoColor.font};">
                                <i class="fa fa-location-dot"></i>
                            </span>
                        </em>
                        <hr style="margin: 4px 0px 4px 0px; border-top: 1px solid ${infoColor.font};"/>
                        <small class="nowrap">
                            <b>Complejidad:</b>
                            <span>${hospital.complexity}</span>
                        </small>
                    </div>
                    <div class="right vertical-slider" style="width: min-content; margin-left: 10px; padding-right: 5px; flex-shrink: 0;">
                        <small>
                            ${hospital.services.split(",").map(service => { index++; return this.createTag(service.trim(), tagColors[index % tagColors.length]) }).join("")}                               
                        </small>    
                     </div>
                </div>
            </div>
        `

        const coordinates = `${hospital.lat}, ${hospital.lng}`

        const pointHtml = `
            <button class="hospital" style="padding: 5px 10px; border: 2px solid ${pointColor.border}; border-radius: 5px; background-color: ${pointColor.back}; color: ${pointColor.font}">
                <code style="text-align: left;">
                    <small>
                        <p>
                            <b>Lat:</b>
                            <span>${hospital.lat}</span>
                        </p>
                        <p>
                            <b>Lng:</b>
                            <span>${hospital.lng}</span>
                        </p>
                    </small>
                </code>
            </button>
        `

        const addCopyFunction = () => {
            const buttonElement = Tooltip.pointTooltip?.getElementsByTagName("button")[0]
            if (buttonElement) {
                buttonElement.onclick = () => Button.copyText(coordinates, buttonElement)
            }
        }

        const addPointEvent = () => {
            const pointElement = Tooltip.infoTooltip?.querySelector(".point-icon")
            if (pointElement instanceof HTMLElement) {
                Tooltip.addPointEvent(pointElement, pointHtml, [addCopyFunction])
            }
        }

        const setVerticalSliderHeight = () => {
            const leftElement = Tooltip.infoTooltip?.querySelector(".left")
            const verticalSlider = Tooltip.infoTooltip?.querySelector(".vertical-slider")
            if (leftElement instanceof HTMLElement && verticalSlider instanceof HTMLElement) {
                verticalSlider.style.height = `${leftElement.offsetHeight}px`
            }
        }

        const setSelectionColors = () => Tooltip.setSelectionColors(selectionColor)
        const setScrollbarColors = () => Tooltip.setScrollbarColors(scrollColor)

        Tooltip.addNameEvent(marker.content, nameHTML)
        Tooltip.addInfoEvent(marker.content, infoHTML, [addPointEvent, setVerticalSliderHeight, setSelectionColors, setScrollbarColors])
    }

    /**
     * 
     * @param {Key} key 
     */
    async createKeyMarker(key) {

        /** @type {PinColor} */
        const pinColors = { background: "#00BFFF", border: "#00BFFF", "glyph": "#FFFFFF", hoverBackground: "#00ace6", hoverBorder: "#00ace6", hoverGlyph: "#FFFFFF" }

        /** @type {UIColor} */
        const nameColor = { back: "#00BFFF", font: "#FFFFFF", border: "#00BFFF" }

        /** @type {UIColor} */
        const infoColor = nameColor

        /** @type {UIColor} */
        const pointColor = { back: "#0099cc", font: "#FFFFFF", border: "#0099cc" }

        /** @type {TextColor} */
        const selectionColor = { back: "#ffffff", font: "#0099cc" }

        const faIcon = "fa-person-walking-luggage"

        const marker = await this.createMarker(key, "Key", faIcon, pinColors)

        const nameHTML = `
            <div class="key" style="max-width: 300px; padding: 10px; border: 2px solid ${nameColor.border}; border-radius: 5px; background-color: ${nameColor.back}; color: ${nameColor.font};">
                <i class="fa ${faIcon}"></i> <span>${key.name}</span>
            </div>
        `

        const infoHTML = `
            <div class="key" style="min-width: 150px; max-width: 300px; padding: 10px; border: 2px solid ${infoColor.border}; border-radius: 5px; background-color: ${infoColor.back}; color: ${infoColor.font};">
                <div style="display: flex; flex-direction: row; justify-content: left; align-items: center;">
                    <div>
                        <h3 style="margin-bottom: 5px;">
                            <i class="fa ${faIcon}"></i>
                            <span>${key.name}</span>
                        </h3>
                        <p style="margin-top: 3px;">${key.address}</p>
                        <small style="display: flex; position: relative;">
                            <em>
                                <span>${key.municipality?.name}</span>
                                <span>(${key.municipality?.department?.name})</span>
                            </em>
                            <span style="position: relative; flex-grow: 1;"></span>
                            <span class="point-icon" style="position: relative; margin-left: 5px; padding-left: 5px; color: ${infoColor.font}; text-align: right;">
                                <i class="fa fa-location-dot fa-xl"></i>
                            </span>
                        </small>
                    </div>
                </div>
            </div>
        `

        const coordinates = `${key.lat}, ${key.lng}`

        const pointHtml = `
            <button class="key" style="padding: 5px 10px; border: 2px solid ${pointColor.border}; border-radius: 5px; background-color: ${pointColor.back}; color: ${pointColor.font}">
                <code style="text-align: left;">
                    <small>
                        <p>
                            <b>Lat:</b>
                            <span>${key.lat}</span>
                        </p>
                        <p>
                            <b>Lng:</b>
                            <span>${key.lng}</span>
                        </p>
                    </small>
                </code>
            </button>
        `

        const addCopyFunction = () => {
            const buttonElement = Tooltip.pointTooltip?.getElementsByTagName("button")[0]
            if (buttonElement) {
                buttonElement.onclick = () => Button.copyText(coordinates, buttonElement)
            }
        }

        const addPointEvent = () => {
            const pointElement = Tooltip.infoTooltip?.querySelector(".point-icon")
            if (pointElement instanceof HTMLElement) {
                Tooltip.addPointEvent(pointElement, pointHtml, [addCopyFunction])
            }
        }

        const setSelectionColors = () => {
            Tooltip.setSelectionColors(selectionColor)
        }

        Tooltip.addNameEvent(marker.content, nameHTML)
        Tooltip.addInfoEvent(marker.content, infoHTML, [addPointEvent, setSelectionColors])
    }
}

// // @ts-ignore
// function getGeometryCenter(geometry) {
//     if (geometry.getType() === "Polygon") {
//         // @ts-ignore
//         const bounds = new google.maps.LatLngBounds();
//         // @ts-ignore
//         geometry.getArray().forEach((path) => {
//             // @ts-ignore
//             path.getArray().forEach((latLng) => {
//                 bounds.extend(latLng);
//             });
//         });
//         return bounds.getCenter();
//     }
//     else if (geometry.getType() === "MultiPolygon") {
//         // @ts-ignore
//         const bounds = new google.maps.LatLngBounds();
//         // @ts-ignore
//         geometry.getArray().forEach((polygon) => {
//             // @ts-ignore
//             polygon.getArray().forEach((path) => {
//                 // @ts-ignore
//                 path.getArray().forEach((latLng) => {
//                     bounds.extend(latLng);
//                 });
//             });
//         });
//         return bounds.getCenter();
//     }
//     return null;
// }