/**
 * @typedef {import('./types.js').Dict} Dict
 */

/**
 * 
 * @param {number} milliseconds 
 * @returns {Promise<any>}
 */
export async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * 
 * @param {string} fileName 
 * @returns {Promise<string>}
 */
export async function loadPlainFile(fileName) {
    return await fetch(`./server/data/${fileName}`).then(res => res.text());
}

/**
 * 
 * @param {string} fileName 
 * @returns {Promise<Dict | Array<Dict>>}
 */
export async function loadJSONFile(fileName) {
    return await fetch(`./server/data/${fileName}`).then(res => res.json());
}

// /**
//  * 
//  * @param {Dict} obj 
//  * @returns {Area | undefined}
//  */
// export function convertObjectToArea(obj){
//     if (obj && obj.hasOwnProperty("name") &&
//     obj.hasOwnProperty("municipalityId") &&
//     obj.hasOwnProperty("hospitalsIds")) {
//     return ({
//         name: obj["name"],
//         municipalityId: obj["municipalityId"],
//         hospitalsIds: obj["hospitalsIds"],
//     })
// } else {
//     return undefined
// }
// }

/**
 * 
 * @param {Array<string>} header 
 * @returns {Object<string, number>}
 */
export function getColNames(header) {
    return header.reduce((accumulator, value, index) => {
        accumulator[value] = index;
        return accumulator;
    }, Object.create(null));
}

/**
 * @param {Dict} data 
 * @param {string} name 
 * @param {HTMLAnchorElement | undefined} a 
 */
export async function saveCSV(data, name = "file.csv", a = undefined) {
    if (!a) {
        a = document.createElement("a");
    }

    const headers = Object.keys(data[0]).join("|");
    const rows = data.map((/** @type {Dict} */ row) => Object.values(row).join("|"));
    const content = [headers, ...rows].join("\n");

    a.href = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
    a.download = `${name}`
    a.click();

    await new Promise(resolve => setTimeout(resolve, 250));

    console.log(`"${a.download}" file downloaded`);

    URL.revokeObjectURL(a.href);
}

/**
 * 
 * @param {number} number 
 * @returns {number}
 */
export function getRandomNumber(number){
    return Math.floor(Math.random() * number);
}

/**
 * 
 * @param {*} array 
 */
export function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

