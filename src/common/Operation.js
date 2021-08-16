import * as dat from './../../lib/dat.gui/build/dat.gui.module.js';
import store from './store.js';
import * as constants from './../utils/constants.js';
import { deepClone } from './../utils/util.js';

export default class Operation {

    /**
     * @description: dat.GUI
     *               https://github.com/dataarts/dat.gui/blob/HEAD/API.md
     * @param {String} name The name of GUI
     */
    constructor() {
        this.bindContent();
        this.bindSubscribe();
    }

    bindContent() {
        // 绑定内容
        const update = key => () => {
            store[key] = Object.assign({}, store[key], this[key]);
        };
        const gui = new dat.GUI();
        const titileController = gui.add(store, 'title');
        store.subscribe('title', val => {
            document.title = val;
            titileController.updateDisplay();
        }, true);
        gui.add(store, 'reset');
        gui.add(store, 'revoke');
        // 星球
        this.planet = deepClone(store.planet);
        const planetFolder = gui.addFolder('Planet');
        planetFolder.add(this.planet, 'show').onFinishChange(update('planet'));
        planetFolder.addColor(this.planet, 'color').onFinishChange(update('planet'));
        const planetDepth = planetFolder.add(this.planet, 'depth', 1, 100).onFinishChange(update('planet'));
        store.subscribe('allWater', val => {
            const min = val.reduce((a, b) => a.depth > b.depth ? a.depth : b.depth, 1);
            planetDepth.min(min);
        });
        // 建筑
        this.buildings = deepClone(store.buildings);
        const buildingsFolder = gui.addFolder('Buildings');
        buildingsFolder.add(this.buildings, 'show').onFinishChange(update('buildings'));
        buildingsFolder.addColor(this.buildings, 'color').onFinishChange(update('buildings'));
        // 建筑 -> 创建建筑
        this.buildingCreate = deepClone(store.buildingCreate);
        const buildingCreateFolder = buildingsFolder.addFolder('buildingCreate');
        buildingCreateFolder.add(this.buildingCreate, 'width', 0, store.planet.cWidth).onFinishChange(update('buildingCreate'));
        buildingCreateFolder.add(this.buildingCreate, 'height', 0, store.planet.cHeight).onFinishChange(update('buildingCreate'));
        buildingCreateFolder.add(this.buildingCreate, 'tall', 0, store.planet.cHeight).onFinishChange(update('buildingCreate'));
        buildingCreateFolder.add(this.buildingCreate, 'showMap').onFinishChange(update('buildingCreate'));
        buildingCreateFolder.add(this.buildingCreate, 'create');
        buildingCreateFolder.add(this.buildingCreate, 'cancelCreate');
        // landmark -> 创建landmark
        this.landmarkCreate = deepClone(store.landmarkCreate);
        let landmarkCreateFolder = buildingsFolder.addFolder('landmarkCreate');
        let landmarkCreateFolderFirstLoad = true;
        
        store.subscribe('landmarkCreate.type', type => {
            buildingsFolder.removeFolder(landmarkCreateFolder);
            landmarkCreateFolder = buildingsFolder.addFolder('landmarkCreate');
            if(!landmarkCreateFolderFirstLoad) {
                landmarkCreateFolder.open();
            }
            landmarkCreateFolder.add(this.landmarkCreate, 'type', ['sphere', 'cylinder', 'cone']).onFinishChange(update('landmarkCreate'));
            if (['cylinder'].includes(type)) {
                landmarkCreateFolder.add(this.landmarkCreate, 'topWidth', 0, store.planet.cWidth).onFinishChange(update('landmarkCreate'));
            }
            if (['sphere', 'cylinder', 'cone'].includes(type)) {
                landmarkCreateFolder.add(this.landmarkCreate, 'width', 0, store.planet.cWidth).onFinishChange(update('landmarkCreate'));
            }
            
            // if (['sphere', 'cylinder', 'cone'].includes(type)) {
            //     landmarkCreateFolder.add(this.landmarkCreate, 'width').onFinishChange(update('landmarkCreate'));
            // }
            if (['cylinder', 'cone'].includes(type)) {
                landmarkCreateFolder.add(this.landmarkCreate, 'tall', 0, store.planet.cHeight).onFinishChange(update('landmarkCreate'));
            }
            if (['cone'].includes(type)) {
                // landmarkCreateFolder.add(this.landmarkCreate, 'segment').onFinishChange(update('landmarkCreate'));
            }
            landmarkCreateFolder.addColor(this.landmarkCreate, 'color').onFinishChange(update('landmarkCreate'));
            landmarkCreateFolder.add(this.landmarkCreate, 'create');
            landmarkCreateFolder.add(this.landmarkCreate, 'cancelCreate');
            
            landmarkCreateFolderFirstLoad = false;
        }, true);

        // 路
        this.roads = deepClone(store.roads);
        const roadsFolder = gui.addFolder('Roads');
        roadsFolder.add(this.roads, 'show').onFinishChange(update('roads'));
        roadsFolder.addColor(this.roads, 'color').onFinishChange(update('roads'));
        // 路 -> 创建路
        this.roadCreate = deepClone(store.roadCreate);
        const roadCreateFolder = roadsFolder.addFolder('roadCreate');
        roadCreateFolder.add(this.roadCreate, 'width', 0, store.planet.cWidth).onFinishChange(update('roadCreate'));
        roadCreateFolder.add(this.roadCreate, 'showMap').onFinishChange(update('roadCreate'));
        roadCreateFolder.add(this.roadCreate, 'create');
        roadCreateFolder.add(this.roadCreate, 'cancelCreate');
        // 水
        this.water = deepClone(store.water);
        const waterFolder = gui.addFolder('Water');
        waterFolder.add(this.water, 'show').onFinishChange(update('water'));
        waterFolder.addColor(this.water, 'color').onFinishChange(update('water'));
        // 水 -> 生成河流
        this.waterCreate = deepClone(store.waterCreate);
        const waterCreateFolder = waterFolder.addFolder('waterCreate');
        waterCreateFolder.add(this.waterCreate, 'width', 0, store.planet.cWidth).onFinishChange(update('waterCreate'));
        const waterCreateDepth = waterCreateFolder.add(this.waterCreate, 'depth', 1, store.planet.depth).onFinishChange(update('waterCreate'));
        store.subscribe('planet.depth', val => {
            waterCreateDepth.max(val);
        }, true);
        waterCreateFolder.add(this.waterCreate, 'showMap').onFinishChange(update('waterCreate'));
        waterCreateFolder.add(this.waterCreate, 'create');
        waterCreateFolder.add(this.waterCreate, 'cancelCreate');
        // 云
        this.cloud = deepClone(store.cloud);
        const cloudFolder = gui.addFolder('Cloud');
        cloudFolder.add(this.cloud, 'show').onFinishChange(update('cloud'));
        // 所有需要刷新的内容
        this.allResetNames = ['planet', 'buildings', 'roads', 'water', 'cloud', 'buildingCreate', 'landmarkCreate', 'waterCreate', 'roadCreate'];
        this.allResetFolders = [planetFolder, buildingsFolder, roadsFolder, waterFolder, cloudFolder, buildingCreateFolder, waterCreateFolder, roadCreateFolder];
    }

    bindSubscribe() {
        // 绑定订阅者
        store.subscribe(constants.RESET_STORE, this.reset.bind(this));
    }

    reset() {
        // 重置
        this.allResetNames.forEach(item => {
            Object.entries(store[item]).forEach(([key, value]) => {
                this[item][key] = value;
            });
        });

        this.allResetFolders.forEach(item => {
            item.updateDisplay();
        });
    }

}
