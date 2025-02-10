export class Point {

    /**
     * @param {number} lat 
     * @param {number} lng 
     */
    constructor(lat, lng) {
        this.lat = lat;
        this.lng = lng;
    }

    getLatLng() {
        return { "lat": this.lat, "lng": this.lng }
    }
}

export class Place extends Point {

    /**
     * @param {string} name 
     * @param {number} lat 
     * @param {number} lng 
     */
    constructor(name, lat, lng) {
        super(lat, lng)
        this.name = name;
    }
}

export class Department extends Place {

    /**
     * 
     * @param {string} id 
     * @param {string} name 
     * @param {number} population 
     * @param {number} estimatedPopulation 
     * @param {number} lat 
     * @param {number} lng 
    */
    constructor(id, name, population, estimatedPopulation, lat, lng) {
        super(name, lat, lng);
        this.id = id
        this.population = population
        this.estimatedPopulation = estimatedPopulation
        /** @type {Array<Municipality>} */
        this.municipalities = []
    }
}

export class Municipality extends Place {

    /**
     * 
     * @param {string} id
     * @param {string} name 
     * @param {string} type 
     * @param {number} population
     * @param {number} estimatedPopulation
     * @param {Department | undefined} department 
     * @param {number} lat 
     * @param {number} lng 
     */
    constructor(id, name, type, population, estimatedPopulation, department, lat, lng) {
        super(name, lat, lng)
        this.id = id
        this.type = type
        this.population = population
        this.estimatedPopulation = estimatedPopulation
        this.department = department
        /** @type {Array<Hospital>} */
        this.hospitals = []
    }
}

export class Hospital extends Place {

    /**
     * 
     * @param {string} id 
     * @param {string} name 
     * @param {number} complexity 
     * @param {string} services
     * @param {Municipality | undefined} municipality 
     * @param {number} lat 
     * @param {number} lng 
     */
    constructor(id, name, complexity, services, municipality, lat, lng) {
        super(name, lat, lng);
        this.id = id
        this.complexity = complexity
        this.services = services
        this.municipality = municipality
    }
}

export class Key extends Place {

    /**
     * 
     * @param {string} name 
     * @param {Municipality | undefined} municipality 
     * @param {string} address  
     * @param {number} lat  
     * @param {number} lng 
     */
    constructor(name, municipality, address, lat, lng) {
        super(name, lat, lng)
        this.municipality = municipality
        this.address = address

        // /** @type {Area|undefined} */
        // this.area = undefined
    }
}

export class Area {

    /**
     * 
     * @param {string} name 
     */
    constructor(name) {
        this.name = name
        /** @type {Array<Point>} */
        this.points = []
    }
}
