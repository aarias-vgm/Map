/**
 * @typedef {import('./modules/types.js').Dict} Dict
 * @typedef {import('./modules/types.js').Feature} Feature
 * @typedef {import('./modules/types.js').GeoJSON} GeoJSON
 */

/**
 * 
 * @param {string} propertiesString 
 * @returns {Array<string>}
 */
function splitProperties(propertiesString) {
    if (propertiesString) {
        return propertiesString.split(",").map((property) => { return property.trim() });
    } else {
        return []
    }
}

/**
 * 
 * @param {Array<any>} array 
 * @returns {Object<any, number>} 
 */
function getIndexDict(array){
    const indexDict = Object.create(null)
    array.forEach((value, index) => {
        indexDict[value.trim()] = index
    })
    return indexDict
}

/**
 * 
 * @param {Dict} dict 
 * @param {string} key 
 * @returns {Dict}
 */
function sortDict(dict, key) {
    return Object.entries(dict).sort(([, a], [, b]) => a[key] - b[key])
}

/**
 * 
 * @param {Array<string>} array 
 * @param {string} text 
 * @returns {Boolean}
 */
function propertiesHasString(array, text) {
    return array.some(item => item.includes(text))
}

/**
 * 
 * @param {string} text 
 * @returns {string}
 */
function normalizeText(text) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
}

/**
 * 
 * @param {string} elementName 
 * @returns {string}
 */
function getTextFromSelection(elementName) {
    /** @type {HTMLInputElement | HTMLElement | null}  */
    const selection = document.querySelector(`input[name="${elementName}"]:checked`)

    if (selection instanceof HTMLInputElement) {
        return selection.value
    } else {
        return ""
    }
}

/**
 * 
 * @param {string} elementId 
 * @returns {string}
 */
function getTextFromElement(elementId) {
    /** @type {HTMLInputElement | HTMLTextAreaElement | HTMLElement | null} */
    const element = document.getElementById(elementId)

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        return element.value
    } else {
        return ""
    }
}

/**
 * 
 * @param {File} file 
 * @returns {Promise<string>}
 */
async function getTextFromFile(file) {
    return await file.text()
}

/**
 * 
 * @param {string} elementId 
 * @returns {Promise<Dict | undefined>}
 */
async function getJSONFromFileElement(elementId) {
    /** @type {HTMLInputElement | HTMLElement | null} */
    const inputElement = document.getElementById(elementId)

    if (inputElement instanceof HTMLInputElement && inputElement.files) {
        const file = inputElement.files[0]
        return await (getJSONfromFile(file))
    } else {
        alert("There is no file to process.")
        return undefined
    }
}

/**
 * 
 * @param {File} file
 * @returns {Promise<Array<Dict> | Dict | undefined>}
 */
async function getJSONfromFile(file) {
    if (file) {
        return JSON.parse(await getTextFromFile(file))
    } else {
        return undefined
    }
}

/**
 * 
 * @param {Dict} json 
 * @returns {GeoJSON | undefined}
 */
function convertJSONtoGeoJSON(json) {
    if (json && json.hasOwnProperty("type") &&
        json.hasOwnProperty("name") &&
        json.hasOwnProperty("crs") &&
        json.hasOwnProperty("features")) {
        return ({
            type: json["type"],
            name: json["name"],
            crs: json["crs"],
            features: json["features"]
        })
    } else {
        return undefined
    }
}

/**
 * 
 * @param {Feature} feature 
 * @param {Array<string>} properties 
 * @returns {Dict}
 */
function getFormattedProperties(feature, properties) {
    let newProperties = Object.create(null)

    for (const property of properties) {
        const splittedProperties = property.split(":")

        const oldKey = splittedProperties[0]
        const newKey = splittedProperties[1]

        newProperties[newKey] = feature.properties[oldKey];
    }

    return newProperties
}

/**
 * 
 * @param {string} idKey
 * @param {GeoJSON} geojson 
 * @param {Array<string>} properties 
 * @returns {Object<string, Dict>}
 */
function getPropertiesDict(idKey, geojson, properties) {

    const propertiesDict = Object.create(null)

    for (const feature of geojson.features) {

        const formattedProperties = getFormattedProperties(feature, properties)

        propertiesDict[formattedProperties[idKey]] = formattedProperties
    }

    return propertiesDict
}

/**
 * 
 * @param {Feature} feature 
 * @param {string} idKey 
 * @param {Array<string>} properties 
 * @param {Object<string, Dict> | undefined} properties2Dict 
 * @returns 
 */
function getNewFeature(feature, idKey, properties, properties2Dict) {
    const newFeature = {
        type: feature.type,
        properties: getFormattedProperties(feature, properties),
        geometry: feature.geometry,
    };

    if (properties2Dict) {
        newFeature.properties = { ...newFeature.properties, ...properties2Dict[newFeature.properties[idKey]] }
        // newFeature.properties = sortProperties(newFeature.properties)
    }

    return newFeature
}

/**
 * @param {Dict} data 
 * @param {string} name 
 * @param {HTMLAnchorElement | undefined} a 
 */
async function downloadCSV(data, name = "file.csv", a = undefined) {
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
 * @param {Dict} data 
 * @param {string} name 
 * @param {HTMLAnchorElement | undefined} a 
 */
async function downloadJSON(data, name = "file.json", a = undefined) {
    if (!a) {
        a = document.createElement("a");
    }

    const content = JSON.stringify(data)

    a.href = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    a.download = `${name}`
    a.click();

    await new Promise(resolve => setTimeout(resolve, 250));

    console.log(`"${a.download}" file downloaded`);

    URL.revokeObjectURL(a.href);
}

async function createGeoJSON() {

    const type = getTextFromSelection("political-type")

    try {
        if (type) {
            const idKey = getTextFromElement("id-key")
            if (idKey) {
                const json1 = await getJSONFromFileElement("file-1")
                if (json1) {
                    const geojson1 = convertJSONtoGeoJSON(json1)
                    if (geojson1) {
                        const file1stringProperties = getTextFromElement("file-1-properties")
                        if (file1stringProperties) {
                            const file1Properties = splitProperties(file1stringProperties)

                            const json2 = await getJSONFromFileElement("file-2")
                            let geojson2 = undefined
                            let file2Properties = undefined
                            let properties2Dict = undefined
                            if (json2) {
                                geojson2 = convertJSONtoGeoJSON(json2)
                                if (geojson2) {
                                    const file2StringProperties = getTextFromElement("file-2-properties")
                                    if (file2StringProperties) {
                                        file2Properties = splitProperties(file2StringProperties)

                                        properties2Dict = getPropertiesDict(idKey, geojson2, file2Properties)
                                    } else {
                                        throw new Error("You must enter file 2 properties");
                                    }
                                } else {
                                    throw new Error("File 2 doesn't contain a GeoJSON")
                                }
                            }
                            switch (type) {
                                case "1":
                                    createPrimaryDivisionGeoJSON(idKey, geojson1, file1Properties, properties2Dict)
                                    break;
                                case "2":
                                    const parentIdKey = getTextFromElement("parent-id-key")
                                    if (parentIdKey) {
                                        const parentNameKey = getTextFromElement("parent-name-key")
                                        createSecondaryDivisionGeoJSON(idKey, parentIdKey, parentNameKey, geojson1, file1Properties, properties2Dict)
                                    } else {
                                        throw new Error("You must enter parent ID key");
                                    }
                                    break;
                            }
                        } else {
                            throw new Error("You must enter file 1 properties");
                        }
                    } else {
                        throw new Error("File 1 doesn't contain a GeoJSON");
                    }
                } else {
                    throw new Error("You must load file 1");
                }
            } else {
                throw new Error("You must enter political division key");
            }
        } else {
            throw new Error("You must select political division type");
        }
    } catch (error) {
        alert(error)
    }
}

/**
 * 
 * @param {string} idKey 
 * @param {GeoJSON} geojson 
 * @param {Array<string>} properties 
 * @param {Object<string, Dict> | undefined} properties2Dict 
 */
function createPrimaryDivisionGeoJSON(idKey, geojson, properties, properties2Dict) {

    const newGeoJson = {
        type: geojson.type,
        name: geojson.name,
        crs: geojson.crs,
        features: geojson.features.map(feature => getNewFeature(feature, idKey, properties, properties2Dict))
    };

    downloadJSON(newGeoJson, "primaryDivision.geojson")
}

/**
 * @param {string} idKey 
 * @param {string} parentIdKey 
 * @param {string} parentNameKey 
 * @param {GeoJSON} geojson 
 * @param {Array<string>} properties 
 * @param {Object<string, Dict> | undefined} properties2Dict 
 */
async function createSecondaryDivisionGeoJSON(idKey, parentIdKey, parentNameKey, geojson, properties, properties2Dict) {

    const featuresDict = Object.create(null)
    /** @type {Object<string, string>} */
    const namesDict = Object.create(null)

    for (const feature of geojson.features) {
        const newFeature = getNewFeature(feature, idKey, properties, properties2Dict)

        const parentId = newFeature.properties[parentIdKey]

        if (parentNameKey) {
            const parentName = newFeature.properties[parentNameKey]
            namesDict[parentId] = parentName
            if (!propertiesHasString(properties, parentNameKey)) {
                delete newFeature.properties[parentNameKey]
            }
        }

        if (!featuresDict[parentId]) {
            featuresDict[parentId] = []
        }

        featuresDict[parentId].push(newFeature)
    }

    const a = document.createElement("a");

    for (const key in featuresDict) {

        const fileName = namesDict[key].charAt(0).toUpperCase() + namesDict[key].slice(1).toLowerCase().replace(/\s(\w)/g, (/** @type {any} */ match, /** @type{string}*/ letter) => letter.toUpperCase()).replace(/[\s.,]/g, '')

        const newGeoJson = {
            type: geojson.type,
            name: `${fileName || 'Department' + key}MunicipalitiesGeoJSON`,
            crs: geojson.crs,
            features: featuresDict[key]
        };

        await downloadJSON(newGeoJson, `${key}.geojson`, a)
    }
}

async function exportGeoJSON() {

    /** @type {HTMLInputElement | HTMLElement | null} */
    const fileElement = document.getElementById("file")

    const exportType = getTextFromSelection("export-type")

    const exportName = getTextFromElement("export-name")

    const exportProperties = splitProperties(getTextFromElement("export-properties"))

    const exportData = []

    if (fileElement && fileElement instanceof HTMLInputElement && fileElement.files) {
        for (const file of fileElement.files) {

            const json = await getJSONfromFile(file)

            if (json) {
                const geojson = convertJSONtoGeoJSON(json)

                if (geojson) {
                    for (const feature of geojson.features) {
                        const data = Object.create(null)
                        for (const property of exportProperties) {
                            data[property] = feature.properties[property]
                        }
                        exportData.push(data)
                    }
                }
            }
        }
    } else {
        alert("Enter at least one file")
    }

    switch (exportType) {
        case "csv":
            downloadCSV(exportData, `${exportName}.csv`)
            break;
        case "json":
            downloadJSON(exportData, `${exportName}.json`)
            break;
    }
}

async function mergeFiles() {
    /** @type {HTMLInputElement | HTMLElement | null} */
    const fileElement = document.getElementById("file")

    const selectedProperties = splitProperties(getTextFromElement("selected-properties"))

    const idKey = getTextFromElement("id-key")

    const fileType = getTextFromSelection("file-type")

    const resultFileName = getTextFromElement("result-file-name")

    let records = Object.create(null)

    if (fileElement && fileElement instanceof HTMLInputElement && fileElement.files) {
        for (const file of fileElement.files) {
            switch (fileType) {
                case "csv":
                    const lines = (await getTextFromFile(file)).split("\n")

                    const cols = Object.create(null)

                    const colsNames = lines[0].split("|")

                    colsNames.forEach((value, index) => {
                        cols[value] = index
                    })

                    for (const colName of colsNames) {
                        if (!selectedProperties.includes(colName)) {
                            delete cols[colName]
                        }
                    }

                    for (let row = 1; row < lines.length; row++) {
                        const line = lines[row].split("|")

                        const record = Object.create(null)

                        for (const [key, value] of Object.entries(cols)) {
                            record[key] = line[value]
                        }

                        if (!records[record[idKey]]) {
                            records[record[idKey]] = record
                        } else {
                            Object.assign(records[record[idKey]], record)
                        }
                    }

                    break;
                case "json":

                    const jsonList = await getJSONfromFile(file)

                    if (jsonList && jsonList instanceof Array) {

                        for (const json of jsonList) {

                            const data = Object.create(null)

                            for (const property of selectedProperties) {
                                data[property] = json[property]
                            }

                            if (!data[data[idKey]]) {
                                data[data[idKey]] = data
                            } else {
                                Object.assign(data[data[idKey]], data)
                            }
                        }
                    }
                    break;
            }
        }
    } else {
        alert("Enter at least one file")
    }

    records = Object.values(records).sort((a, b) => a[idKey] - b[idKey])

    switch (fileType) {
        case "csv":
            downloadCSV(records, `${resultFileName}.csv`)
            break;
        case "json":
            downloadJSON(records, `${resultFileName}.json`)
            break;
    }
}

async function appendProperties() {
    /** @type {HTMLInputElement | HTMLElement | null} */
    const fileElement1 = document.getElementById("file-1")

    /** @type {HTMLInputElement | HTMLElement | null} */
    const fileElement2 = document.getElementById("file-2")

    const properties = splitProperties(getTextFromElement("properties"))

    const propsList = []

    for (const property of properties) {
        const [newPropFile1, propFile2, relPropFile1, relPropFile2] = property.split(":")

        propsList.push({
                'newPropFile1':newPropFile1,
                'propFile2':propFile2,
                'relPropFile1':relPropFile1,
                'relPropFile2':relPropFile2
            })
    } 

    const fileType = getTextFromSelection("file-type")
    
    const resultFileName = getTextFromElement("result-file-name")

    if (fileElement1 && fileElement1 instanceof HTMLInputElement && fileElement1.files &&
        fileElement2 && fileElement2 instanceof HTMLInputElement && fileElement2.files) {

        const file1 = fileElement1.files[0]
        const file2 = fileElement2.files[0]
        
        const records = []

        const newProps = Object.create(null)

        for (const {newPropFile1, propFile2, relPropFile1, relPropFile2} of propsList){
            newProps[newPropFile1] = Object.create(null)
        }

        switch (fileType) {
            case "csv":

                const file2Lines = (await getTextFromFile(file2)).split("\n")
                const file2Cols = getIndexDict(file2Lines[0].split("|"))
                
                for (let row = 1; row < file2Lines.length; row++) {
                    const line = file2Lines[row].split("|")

                    // municipalityId | id | municipalityName | name
                    for (const {newPropFile1, propFile2, relPropFile1, relPropFile2} of propsList){

                        const relatedPropName = normalizeText(line[file2Cols[relPropFile2]])

                        newProps[newPropFile1][relatedPropName] = line[file2Cols[propFile2]]
                    }
                }

                const file1Lines = (await getTextFromFile(file1)).split("\n")
                const file1Cols = getIndexDict(file1Lines[0].split("|"))
                
                for (let row = 1; row < file1Lines.length; row++) {
                    const line = file1Lines[row].split("|")
                    
                    const record = Object.create(null)
                    
                    for (const [key, value] of Object.entries(file1Cols)) {
                        record[key] = line[value].trim()
                    }
                    
                    // municipalityId | id | municipalityName | name
                    for (const {newPropFile1, propFile2, relPropFile1, relPropFile2} of propsList){
                        const relatedPropName = normalizeText(line[file1Cols[relPropFile1]])
                        record[newPropFile1] = newProps[newPropFile1][relatedPropName]
                    }

                    records.push(record)
                }

                downloadCSV(records, `${resultFileName}.csv`)

                break;
            case "json":
                break;
        }
    }
}

// async function replaceProperties() {
//     /** @type {HTMLInputElement | HTMLElement | null} */
//     const fileElement1 = document.getElementById("file-1")

//     /** @type {HTMLInputElement | HTMLElement | null} */
//     const fileElement2 = document.getElementById("file-2")

//     const properties = splitProperties(getTextFromElement("properties"))

//     const fileType = getTextFromSelection("file-type")
    
//     const resultFileName = getTextFromElement("result-file-name")

//     if (fileElement1 && fileElement1 instanceof HTMLInputElement && fileElement1.files &&
//         fileElement2 && fileElement2 instanceof HTMLInputElement && fileElement2.files) {

//         const file1 = fileElement1.files[0]
//         const file2 = fileElement2.files[0]
        
//         const records = []

//         const propsToReplace = Object.create(null)

//         switch (fileType) {
//             case "csv":

//                 const file2Lines = (await getTextFromFile(file2)).split("\n")
//                 const file2Cols = getIndexDict(file2Lines[0].split("|"))
//                 console.log(file2Cols)
                
//                 for (let row = 1; row < file2Lines.length; row++) {
//                     const line = file2Lines[row].split("|")

//                     for (const property of properties) {
//                         const [oldProperty, newProperty] = property.split(":")

//                         if (!propsToReplace[oldProperty]){
//                             propsToReplace[oldProperty] = Object.create(null)
//                         } else {
//                             propsToReplace[oldProperty][file2Cols[oldProperty]] = line[file2Cols[newProperty]]
//                         }
//                     } 
//                 }

//                 console.log(propsToReplace)
                
//                 const file1Lines = (await getTextFromFile(file1)).split("\n")
//                 const file1Cols = getIndexDict(file1Lines[0].split("|"))
//                 console.log(file1Cols)

//                 for (let row = 1; row < file1Lines.length; row++) {
//                     const line = file1Lines[row].split("|")

//                     const record = Object.create(null)

//                     for (const [key, value] of Object.entries(file1Cols)) {
//                         record[key] = line[value]
//                     }

//                     console.log(record)

//                     for (const property of properties) {
//                         const [oldProperty, newProperty] = property.split(":")

//                         record[oldProperty] = propsToReplace[oldProperty][line[file2Cols[oldProperty]]]
//                     } 

//                     records.push(record)
//                 }

//                 downloadCSV(records, `${resultFileName}.csv`)

//                 break;
//             case "json":
//                 break;
//         }
//     }

//     let resultData = Object.create(null)
// }