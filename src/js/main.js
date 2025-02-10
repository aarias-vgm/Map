import Map from "./modules/map.js"
import { loadPlainFile, loadJSONFile, getColNames, getRandomElement, saveCSV } from "./modules/utils.js"
import { Department, Municipality, Hospital, Area, Key, Point } from "./modules/classes.js"

/**
 * @typedef {import('./modules/types.js').Dict} Dict
 * @typedef {import('./modules/types.js').PolygonColor} PolygonColor
 */

async function run() {

    const departments = await loadDepartments()

    const municipalities = await loadMunicipalities(departments)

    /** @type {Object<string, Hospital>} */
    let hospitals = await loadHospitals(municipalities)

    hospitals = Object.entries(hospitals)
        .filter(([clave, hospital]) => hospital.complexity == 1)
        .reduce((acc, [clave, valor]) => {
            // @ts-ignore
            acc[clave] = valor;
            return acc;
        }, {});

    const keys = await loadKeys(municipalities)

    const areas = await loadAreas(hospitals)

    const map = new Map()

    map.initialize()

    const hospitalsArray = Object.values(hospitals)

    // for (const hospital of Object.values(hospitals)) {
    for (let i = 0; i < hospitalsArray.length; i++) {
        await map.createHospitalMarker(hospitalsArray[i])
    }

    for (const key of keys) {
        await map.createKeyMarker(key)
    }

    for (let i = 0; i < areas.length; i++){
    // for (const area of areas){
        // console.log(area.name)
        // map.createPolygon(area.points, area.name)
        console.log(areas[i].name)
        map.createPolygon(areas[i].points, areas[i].name)
    }
}

/**
 * 
 * @returns {Promise<Object<string, Department>>}
 */
async function loadDepartments() {
    const lines = (await loadPlainFile("csv/departments.csv")).split("\n")


    const cols = getColNames(lines[0].split("|"))

    const departments = Object.create(null)

    for (let row = 1; row < lines.length; row++) {
        const line = lines[row].split("|")

        const department = new Department(
            line[cols["id"]],
            line[cols["name"]],
            Number(line[cols["population2025"]]),
            Number(line[cols["population2035"]]),
            Number(line[cols["lat"]]),
            Number(line[cols["lng"]])
        )

        departments[department.id] = department
    }

    return departments
}

/**
 * 
 * @param {Object<string, Department> | null} departments 
 * @returns {Promise<Object<string, Municipality>>}
 */
async function loadMunicipalities(departments = null) {
    const lines = (await loadPlainFile("csv/municipalities.csv")).split("\n")

    const cols = getColNames(lines[0].split("|"))

    const municipalities = Object.create(null)

    for (let row = 1; row < lines.length; row++) {
        const line = lines[row].split("|")

        let department = undefined
        if (departments) {
            department = departments[line[cols["departmentId"]]]
        }

        const municipality = new Municipality(
            line[cols["id"]],
            line[cols["name"]],
            line[cols["type"]],
            Number(line[cols["population2025"]]),
            Number(line[cols["population2035"]]),
            department,
            Number(line[cols["lat"]]),
            Number(line[cols["lng"]])
        )

        if (department) {
            department.municipalities.push(municipality)
        }

        municipalities[municipality.id] = municipality
    }

    return municipalities
}

/**
 * 
 * @param {Object<string, Municipality> | null} municipalities 
 * @returns {Promise<Object<string, Hospital>>}
 */
async function loadHospitals(municipalities = null) {
    const lines = (await loadPlainFile("csv/hospitals.csv")).split("\n")

    const cols = getColNames(lines[0].split("|"))

    const hospitals = Object.create(null)

    for (let row = 1; row < lines.length; row++) {
        const line = lines[row].split("|")

        let municipality = undefined

        if (municipalities) {
            municipality = municipalities[line[cols["municipalityId"]]]
        }

        let id = line[cols["id"]]

        if (hospitals[id]) {
            let index = 1

            let hospitalExists = true

            let newId = ""

            while (hospitalExists) {
                newId = `${id}-${index}`

                if (hospitals[newId]) {
                    index++
                } else {
                    hospitalExists = false
                }
            }

            id = newId
        }

        const hospital = new Hospital(
            id,
            line[cols["name"]],
            Number(line[cols["complexity"]]),
            line[cols["services"]],
            municipality,
            Number(line[cols["lat"]]),
            Number(line[cols["lng"]])
        )

        if (municipality) {
            municipality.hospitals.push(hospital)
        }

        hospitals[hospital.id] = hospital

    }

    return hospitals
}

/**
 * @param {Object<string, Municipality> | null} municipalities 
 * @returns {Promise<Array<Key>>}
 */
async function loadKeys(municipalities = null) {

    const objects = await loadJSONFile("json/keys.json")

    const keys = []

    if (objects instanceof Array) {

        for (const object of objects) {
            let municipality = undefined

            if (municipalities) {
                municipality = municipalities[object["municipalityId"]]
            }

            const key = new Key(object["name"], municipality, object["address"], object["lat"], object["lng"])

            keys.push(key)
        }

    }
    return keys
}

/**
 * @param {Object<string, Hospital>} hospitals 
 * @returns {Promise<Array<Area>>}
 */
async function loadAreas(hospitals) {

    // saveCSV(Object.values(hospitals), "hospitals-processed")

    const objects = await loadJSONFile("json/areas.json")

    const areas = []

    if (objects instanceof Array) {
        for (const object of objects) {

            const area = new Area(object["name"])

            for (const hospitalId of object["hospitalsIds"]) {

                const hospital = hospitals[hospitalId]

                if (hospital) {
                    area.points.push(new Point(hospital.lat, hospital.lng))
                } else {
                    let id = hospitalId

                    let index = 1

                    let hospitalFound = false

                    let newId = ""

                    while (index < 10 && !hospitalFound) {
                        newId = `${id}-${index}`

                        if (!hospitals[newId]) {
                            index++
                        } else {
                            hospitalFound = true
                        }
                    }

                    id = newId
                }

            }

            areas.push(area)
        }
    }

    return areas
}

run()