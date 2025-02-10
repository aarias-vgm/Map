/**
 * @typedef {import('./types.js').Pixel} Pixel
 * @typedef {import('./types.js').Color} Color
 * @typedef {import('./types.js').TextColor} TextColor
 * @typedef {import('./types.js').Callable} Callable
 */

// Tooltips

/** @type {HTMLElement | null} */
const nameTooltip = document.getElementById("name-tooltip")

/** @type {HTMLElement | null} */
const infoTooltip = document.getElementById("info-tooltip")

/** @type {HTMLElement | null} */
const pointTooltip = document.getElementById("point-tooltip")

/** @type {EventTarget | null} */
let lastTarget

/** @type {Array<HTMLElement>} */
let openElements = []

/**
 * 
 * @param {HTMLElement} element 
 * @returns {{x:number, y:number, w:number, h:number}}
 */
function getRect(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.x + (rect.width / 2), y: rect.y, w: rect.width, h: rect.height }
}

/**
 * 
 * @param {string} property 
 * @param {string} color 
 */
function setColorVars(property, color) {
    document.documentElement.style.setProperty(property, color)
}

/**
 * 
 * @param {TextColor} textColor
 */
function setSelectionColors(textColor) {
    setColorVars("--selection-back-color", textColor.back)
    setColorVars("--selection-font-color", textColor.font)
}

/**
 * 
 * @param {Color} color 
 */
function setScrollbarColors(color) {
    setColorVars("--scrollbar-thumb-color", color.fore)
    setColorVars("--scrollbar-track-color", color.back)
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {string} html 
 * @param {Array<Callable>} callables
 */
function addNameEvent(element, html, callables = []) {
    if (nameTooltip) {

        let show = () => true

        if (infoTooltip) {
            show = () => infoTooltip.classList.contains("hidden")
        }

        element.addEventListener("mouseenter", (event) => {
            if (show()) {
                nameTooltip.innerHTML = html

                for (const callable of callables) {
                    callable()
                }

                const rect = getRect(element)
                positionTooltip(nameTooltip, rect.x, rect.y - nameTooltip.offsetHeight - 5)

                nameTooltip.classList.replace("hidden", "visible");
            }
        });

        element.addEventListener("mouseleave", (event) => {
            if (show()) {
                nameTooltip.classList.replace("visible", "hidden");
            }
        });
    }
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {string} html 
 * @param {Array<Callable>} callables
 */
function addInfoEvent(element, html, callables = []) {
    if (infoTooltip) {
        element.addEventListener("click", (event) => {
            // if (infoTooltip.classList.contains("hidden")) {

            nameTooltip?.classList.replace("visible", "hidden");

            infoTooltip.innerHTML = html

            for (const callable of callables) {
                callable()
            }

            const pixel = getRect(element)
            positionTooltip(infoTooltip, pixel.x, pixel.y - infoTooltip.offsetHeight - 5)

            infoTooltip.classList.replace("hidden", "visible");

            lastTarget = event.target

            if (!openElements.includes(infoTooltip)) {
                openElements.push(infoTooltip)
            }

            document.addEventListener('click', hideElement);

            // }
        });
    }
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {string} html 
 * @param {Array<Callable>} callables
 */
function addPointEvent(element, html, callables = []) {
    if (pointTooltip) {

        element.addEventListener("click", (event) => {
            if (pointTooltip.classList.contains("hidden")) {

                pointTooltip.innerHTML = html

                for (const callable of callables) {
                    callable()
                }

                const rect = getRect(element)

                positionTooltip(pointTooltip, rect.x, rect.y + rect.h)

                pointTooltip.classList.replace("hidden", "visible");

                lastTarget = event.target

                openElements.push(pointTooltip)

                document.addEventListener('click', hideElement);
            }
        });
    }
}

/**
 * 
 * @param {Event} event 
 */
function hideElement(event) {
    if (event.target != lastTarget) {

        // @ts-ignore
        let targetIndex = openElements.findIndex(descendant => descendant.contains(event.target));

        // target index == -1: target is not open
        // target index != -1: target is not open

        for (let i = openElements.length - 1; targetIndex < i; i--) {
            openElements[i].classList.replace("visible", "hidden");
            openElements.splice(i, 1)
        }
    }

    if (!openElements) {
        document.removeEventListener('click', hideElement);
    }
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {number} x 
 * @param {number} y 
 */
function positionTooltip(element, x, y) {

    const offset = 20

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const elementWidth = element.offsetWidth;

    if (x - (elementWidth / 2) <= offset) {
        x = offset + (elementWidth / 2)
    } else if (x + (elementWidth / 2) > screenWidth - offset) {
        x = screenWidth - offset - (elementWidth / 2);
    }

    if (y < offset) {
        y = offset;
    } else if (y > screenHeight - offset) {
        y = screenHeight - offset
    }

    element.style.position = "absolute";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
}

const Tooltip = {
    nameTooltip: nameTooltip,
    infoTooltip: infoTooltip,
    pointTooltip: pointTooltip,
    addNameEvent: addNameEvent,
    addInfoEvent: addInfoEvent,
    addPointEvent: addPointEvent,
    setSelectionColors: setSelectionColors,
    setScrollbarColors: setScrollbarColors,
}

export default Tooltip