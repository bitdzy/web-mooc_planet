import * as constants from './../utils/constants.js';
import { generateUUID, PubSub } from './../utils/util.js';

class Store extends PubSub {
    
    constructor() {
        super();
        this._revoke = false;
        this._history = [];
        this._title = '百度精品班2021';
        this._allBuildings = [];
        this._allRoads = [];
        this._allLandmarks = [];
        this._allWater = [];
        this._allCloud = [];
        this.reset();
    }

    reset() {
        // 重置信息
        this.planet = {
            show: true,
            color: '#c2ebb6',
            depth: 50,
            cWidth: 360,
            cHeight: 360,
            texture: constants.TEXTURE_IMAGE_PAPER_DETAIL
        };
        this.buildings = {
            show: true,
            color: '#fab8b8'
        };
        this.buildingCreate = {
            width: 20,
            height: 20,
            tall: 40,
            showMap: false,
            texture: constants.TEXTURE_IMAGE_BUILDING,
            create: () => {
                this[constants.HANDLE_BUILDING_CREATE] = generateUUID();
                this.publish(constants.HANDLE_BUILDING_CREATE);
            },
            cancelCreate: () => {
                this[constants.HANDLE_BUILDING_CANCEL_CREATE] = generateUUID();
                this.publish(constants.HANDLE_BUILDING_CANCEL_CREATE);
            }
        };
        // 地标 默认值
        this.landmarkCreate = {
            topWidth: 20,
            width: 40,
            tall: 80,
            segment: 8,
            type: 'cylinder',
            color: '#cccccc',
            create: () => {
                this[constants.HANDLE_LANDMARK_CREATE] = generateUUID();
                this.publish(constants.HANDLE_LANDMARK_CREATE);
            },
            cancelCreate: () => {
                this[constants.HANDLE_LANDMARK_CANCEL_CREATE] = generateUUID();
                this.publish(constants.HANDLE_LANDMARK_CANCEL_CREATE);
            }
        };
        this.roads = {
            show: true,
            color: '#828282',
        };
        this.roadCreate = {
            width: 20,
            showMap: false,
            texture: constants.TEXTURE_IMAGE_ROAD,
            create: () => {
                this[constants.HANDLE_ROAD_CREATE] = generateUUID();
                this.publish(constants.HANDLE_ROAD_CREATE);
            },
            cancelCreate: () => {
                this[constants.HANDLE_ROAD_CANCEL_CREATE] = generateUUID();
                this.publish(constants.HANDLE_ROAD_CANCEL_CREATE);
            }
        };
        this.water = {
            show: true,
            color: '#80a9d7'
        };
        this.waterCreate = {
            width: 10,
            depth: 20,
            showMap: false,
            texture: constants.TEXTURE_IMAGE_WATER,
            create: () => {
                this[constants.HANDLE_WATER_CREATE] = generateUUID();
                this.publish(constants.HANDLE_WATER_CREATE);
            },
            cancelCreate: () => {
                this[constants.HANDLE_WATER_CANCEL_CREATE] = generateUUID();
                this.publish(constants.HANDLE_WATER_CANCEL_CREATE);
            }
        };
        this.cloud = {
            show: true
        };
        this[constants.RESET_STORE] = generateUUID();
        this.publish(constants.RESET_STORE);
    }

    setHistory(key, value = this[key]) {
        if (this._revoke) {
            return;
        }
        this._history.push([ key, value ]);
    }

    revoke() {
        let his = this._history.pop();
        if (!his) {
            return;
        }
        if (his[1] === this[his[0]]) {
            this.revoke();
            return;
        }
        this._revoke = true;
        const [key, value] = his;
        if (key === 'allBuildings') {
            this[constants.HANDLE_REVOKE_BUILDING] = generateUUID();
            this.publish(constants.HANDLE_REVOKE_BUILDING);
        }
        if (key === 'allRoads') {
            this[constants.HANDLE_REVOKE_ROAD] = generateUUID();
            this.publish(constants.HANDLE_REVOKE_ROAD);
        }
        if (key === 'allLandmarks') {
            this[constants.HANDLE_REVOKE_LANDMARKS] = generateUUID();
            this.publish(constants.HANDLE_REVOKE_LANDMARKS);
        }
        if (key === 'allWater') {
            this[constants.HANDLE_REVOKE_WATER] = generateUUID();
            this.publish(constants.HANDLE_REVOKE_WATER);
        }
        this[key] = value;
        this._revoke = false;
    }

    get title() {
        return this._title;
    }

    set title(val) {
        this.setHistory('title');
        this._title = val;
        this.publish('title');
    }

    get allObjects() {
        return [...this.allBuildings, ...this.allRoads, ...this.allLandmarks, ...this.allWater];
    }

    get allBuildings() {
        return this._allBuildings;
    }

    set allBuildings(val) {
        this.setHistory('allBuildings', this.allBuildings);
        this._allBuildings = val;
        this.publish('allBuildings');
    }

    get allRoads() {
        return this._allRoads;
    }

    set allRoads(val) {
        this.setHistory('allRoads', this.allRoads);
        this._allRoads = val;
        this.publish('allRoads');
    }

    get allLandmarks() {
        return this._allLandmarks;
    }

    set allLandmarks(val) {
        this.setHistory('allLandmarks', this.allLandmarks);
        this._allLandmarks = val;
        this.publish('allLandmarks');
    }

    get allWater() {
        return this._allWater;
    }

    set allWater(val) {
        this.setHistory('allWater', this.allWater);
        this._allWater = val;
        this.publish('allWater');
    }

    get allCloud() {
        return this._allCloud;
    }

    set allCloud(val) {
        this._allCloud = val;
        this.publish('allCloud');
    }

    get planet() {
        return this._planet;
    }

    set planet(val) {
        this._planet = val;
        this.publish('planet');
    }

    get buildings() {
        return this._buildings;
    }

    set buildings(val) {
        this._buildings = val;
        this.publish('buildings');
    }

    get buildingCreate() {
        return this._buildingCreate;
    }

    set buildingCreate(val) {
        this._buildingCreate = val;
        this.publish('buildingCreate');
    }

    // get landmark
    get landmarkCreate() {
        return this._landmarkCreate;
    }

    set landmarkCreate(val) {
        this._landmarkCreate = val;
        this.publish('landmarkCreate');
    }

    get roads() {
        return this._roads;
    }

    set roads(val) {
        this._roads = val;
        this.publish('roads');
    }

    get roadCreate() {
        return this._roadCreate;
    }

    set roadCreate(val) {
        this._roadCreate = val;
        this.publish('roadCreate');
    }

    get water() {
        return this._water;
    }

    set water(val) {
        this._water = val;
        this.publish('water');
    }

    get waterCreate() {
        return this._waterCreate;
    }

    set waterCreate(val) {
        this._waterCreate = val;
        this.publish('waterCreate');
    }

    get cloud() {
        return this._cloud;
    }

    set cloud(val) {
        this._cloud = val;
        this.publish('cloud');
    }
    
}

export default new Store();
