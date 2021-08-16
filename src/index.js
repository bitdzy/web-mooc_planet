// import './../node_modules/three/build/three.js';
// import './../node_modules/three/examples/js/controls/OrbitControls.js';
import './../lib/three.js';
import './../lib/OrbitControls.js';
import store from './common/store.js';
import * as constants from './utils/constants.js';
import Map from './components/Map.js';
import Operation from './common/Operation.js';
import Scene from './common/Scene.js';
import Renderer from './common/Renderer.js';
import Building from './components/Building.js';
import PlanetCuboid from './components/PlanetCuboid.js';
import Illuminant from './components/Illuminant.js';
import Water from './components/Water.js';
import Road from './components/Road.js';
import CreateHelper from './common/CreateHelper.js';
import Cloud from './components/Cloud.js';
import Landmark from './components/Landmark.js';

const __SHOW_AXES__ = false;
const __SHOW_LIGHT__ = false;

class App {

    constructor() {
        this.initResources();
        const parent = document.getElementById('cas');
        const { width: pWidth, height: pHeight } = parent.getBoundingClientRect();
        this.renderer = new Renderer({ parent });
        this.scene = new Scene();
        this.width = pWidth;
        this.height = pHeight;
        this.camera = new THREE.PerspectiveCamera(45, pWidth / pHeight, 1, 10000);
        this.camera.position.z = 600;
        this.camera.position.y = -600;
        // 鼠标操作 左键滑动，右键滑动和滚轮操作
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.addEventListener('change', this.render.bind(this));

        // 添加光源
        this.illuminant = new Illuminant();
        this.illuminant.setPosition(700, -700, 1050);
        this.illuminant.addToScene(this.scene);

        // 参考线、
        if (__SHOW_AXES__) {
            const axesHelper = new THREE.AxesHelper(1000);
            this.scene.add(axesHelper);

        }

        // 模拟聚光灯 SpotLight 的锥形辅助对象.
        if (__SHOW_LIGHT__) {
            const spotLightHelper = new THREE.SpotLightHelper( this.illuminant.mesh );
            this.scene.add( spotLightHelper );
        }

        // 创建平面星球
        this.planetCuboid = new PlanetCuboid();
        this.planetCuboid.addToScene(this.scene);
        // 创建
        this.createHelper = new CreateHelper(this);
        //创建云（数量，种类可调整）
        this.createCloud(10, 2);
        // 渲染
        this.render();
        // 初始化dat.gui
        this.initDatGui();
        // 绑定订阅事件
        this.bindSubscribe();
        // 绑定事件
        this.bindEvents();
        // 初始化地图
        this.map = new Map();
    }

    bindSubscribe() {
        // 绑定订阅
        this.cancelCreate = this.cancelCreate.bind(this);
        // 星球颜色
        store.subscribe('planet.color', this.updatePlanetColor.bind(this), true);
        // 星球是否显示
        store.subscribe('planet.show', this.updatePlanetVisible.bind(this), true);
        // 星球depth
        store.subscribe('planet.depth', this.updatePlanetDepth.bind(this), true);
        // 建筑是否显示
        store.subscribe('buildings.show', this.updateBuildingVisible.bind(this));
        // 建筑颜色
        store.subscribe('buildings.color', color => {
            // 更新建筑颜色
            this.updateBuildingColor(color);
            // 更新地图中建筑的颜色
            this.mapDrawBuildings();
        });
        // 道路是否显示
        store.subscribe('roads.show', this.updateRoadsVisible.bind(this));
        // 道路颜色
        store.subscribe('roads.color', color => {
            // 更新道路颜色
            this.updateRoadsColor(color);
            // 更新地图中道路的颜色
            this.mapDrawRoads();
        });
        // 水是否显示
        store.subscribe('water.show', this.updateWaterVisible.bind(this));
        // 水颜色
        store.subscribe('water.color', color => {
            // 更新水的颜色
            this.updateWaterColor(color);
            // 更新地图中水的颜色
            this.mapDrawWater();
        });
        // 云是否显示
        store.subscribe('cloud.show', this.updateCloudVisible.bind(this));
        // 创建建筑
        store.subscribe(constants.HANDLE_BUILDING_CREATE, this.createBuilding.bind(this));
        // 取消创建建筑
        store.subscribe(constants.HANDLE_BUILDING_CANCEL_CREATE, this.cancelCreate);
        // 创建地标
        store.subscribe(constants.HANDLE_LANDMARK_CREATE, this.createLandmark.bind(this));
        // 取消创建地标
        store.subscribe(constants.HANDLE_LANDMARK_CANCEL_CREATE, this.cancelCreate);
        // 创建路
        store.subscribe(constants.HANDLE_ROAD_CREATE, this.createRoad.bind(this));
        // 取消创建路
        store.subscribe(constants.HANDLE_ROAD_CANCEL_CREATE, this.cancelCreate);
        // 创建水
        store.subscribe(constants.HANDLE_WATER_CREATE, this.createWater.bind(this));
        // 取消创建水
        store.subscribe(constants.HANDLE_WATER_CANCEL_CREATE, this.cancelCreate);
        // 绘制建筑
        store.subscribe('allBuildings', this.mapDraw.bind(this));
        // 绘制地标建筑
        store.subscribe('allLandmarks', this.mapDraw.bind(this));
        // 绘制路
        store.subscribe('allRoads', this.mapDraw.bind(this));
        // 绘制水
        store.subscribe('allWater', this.mapDraw.bind(this));
        // 取消创建建筑
        store.subscribe(constants.HANDLE_REVOKE_BUILDING, () => {
            store.allBuildings[store.allBuildings.length - 1].invisible();
        });
        // 取消创建路
        store.subscribe(constants.HANDLE_REVOKE_ROAD, () => {
            store.allRoads[store.allRoads.length - 1].invisible();
        });
        // 取消创建地标建筑
        store.subscribe(constants.HANDLE_REVOKE_LANDMARKS, () => {
            store.allLandmarks[store.allLandmarks.length - 1].invisible();
        });
        // 取消创建水
        store.subscribe(constants.HANDLE_REVOKE_WATER, () => {
            store.allWater[store.allWater.length - 1].invisible();
        });

    }
    
    render() {
        // 渲染
        if (!this.rendering) {
            this.rendering = true;
            window.requestAnimationFrame(() => {
                // 处理加载贴图时的异步事件
                window.requestAnimationFrame(this.render.bind(this));
                //光源运动渲染
                this.illuminant.updateIlluminant();
                this.renderer.render(this.scene, this.camera);
                this.rendering = false;
            });
        }
    }

    initResources() {
        //  初始化资源
        const cb = () => {
            this.render();
        }
        store.textureWater = new THREE.TextureLoader().load(store.waterCreate.texture, cb);
        store.textureRoad = new THREE.TextureLoader().load(store.roadCreate.texture, cb);
        store.textureBuilding = new THREE.TextureLoader().load(store.buildingCreate.texture, cb);
        store.texturePlanet = new THREE.TextureLoader().load(store.planet.texture, cb);
    }

    initDatGui() {
        // 初始化dat.ui
        new Operation();
    }

    bindEvents() {
        // 绑定事件
        window.addEventListener('keydown', this.handleRevoke, false);
    }

    handleRevoke(event) {
        // 撤回
        const { ctrlKey, metaKey, key } = event;
        if ([ctrlKey, metaKey].some(Boolean) && key === 'z') {
            store.revoke();
        }
    }

    cancelCreate() {
        // 取消创建
        this.createHelper.hide();
    }

    createBuilding() {
        // 创建建筑
        const { width, height, tall: depth, showMap} = store.buildingCreate;
        this.createHelper.show({ width, height }, (x, y) => {
            const building = new Building({ width, height, depth, showMap });
            building.setPosition(x, y);
            building.addToScene(this.scene);
            store.allBuildings = [...store.allBuildings, building];
        });
    }

    createLandmark() {
        // 创建landmark 
        let { width, tall: height, type, color, topWidth } = store.landmarkCreate;
        topWidth = type === 'cylinder' ? topWidth : 0;
        this.createHelper.show({ width, height, topWidth, type }, (x, y) => {
            const building = new Landmark({ width, height, type, color, topWidth });
            const halfW = (topWidth - width) / 2;
            building.setPosition(width >= topWidth ? x : x + halfW, y);
            building.addToScene(this.scene);
            store.allLandmarks = [...store.allLandmarks, building];
        });
    }

    createRoad() {
        // 创建路
        const { width, showMap } = store.roadCreate;
        this.createHelper.show({ type: 'clash', width }, (x, y, height, angle) => {
            const road = new Road({ width, height, angle, showMap });
            road.setPosition(x, y);
            road.addToScene(this.scene);
            store.allRoads = [...store.allRoads, road];
        });
    }

    createWater() {
        // 创建水
        const { width, showMap, depth } = store.waterCreate;
        this.createHelper.show({ type: 'clash', width }, (x, y, height, angle) => {
            const water = new Water({ width, height, angle, showMap, depth });
            water.setPosition(x, y, -depth + 1);
            water.addToScene(this.scene);
            store.allWater = [...store.allWater, water];
        });
   }

    createCloud(num, type) {
        // 创建云
        const allCloud = [];
        for (let i = 0; i < num; i++) {
            const cloud = new Cloud(type);
            cloud.setPosition(Math.random() * 360, Math.random() * 360, 200);
            cloud.setRandrotation();
            cloud.addToScene(this.scene);
            allCloud.push(cloud);
        }
        store.allCloud = allCloud;
    }

    updatePlanetColor(color) {
        // 更新星球颜色
        if (this.planetCuboid) {
            this.planetCuboid.updateColor(color);
            this.render();
        }
    }

    updatePlanetVisible(visible) {
        // 星球是否显示
        const method = visible
            ? 'visible'
            : 'invisible';
        this.planetCuboid && this.planetCuboid[method]();
        store.allObjects.forEach(item => {
            item && item[method]();
        });
        this.render();
    }

    updatePlanetDepth(val) {
        // 星球深度
        this.planetCuboid.updateDepth(val);
        [...store.allObjects, ...store.allCloud].forEach(item => {
            item && item.setPosition();
        });
        this.render();
    }

    updateBuildingVisible(visible) {
        // 建筑是否显示
        const method = visible
            ? 'visible'
            : 'invisible';
        [...store.allBuildings, ...store.allLandmarks].forEach(item => {
            item && item[method]();
        });
        this.render();
    }

    updateBuildingColor(color) {
        // 更新建筑颜色
        store.allBuildings.forEach(item => {
            item.updateColor(color);
        });
        this.render();
    }

    updateRoadsVisible(visible) {
        // 道路是否显示
        const method = visible
            ? 'visible'
            : 'invisible';
        store.allRoads.forEach(item => {
            item && item[method]();
        });
        this.render();
    }

    updateRoadsColor(color) {
        // 道路颜色
        store.allRoads.forEach(item => {
            item.updateColor(color);
        });
        this.render();
    }

    updateWaterVisible(visible) {
        // 水是否显示
        const method = visible
            ? 'visible'
            : 'invisible';
        store.allWater.forEach(item => {
            item && item[method]();
        });
        this.render();
    }

    updateWaterColor(color) {
        // 水颜色
        store.allWater.forEach(item => {
            item.updateColor(color);
        });
        this.render();
    }

    updateCloudVisible(visible) {
        // 云是否显示
        const method = visible
            ? 'visible'
            : 'invisible';
        store.allCloud.forEach(item => {
            item && item[method]();
        });
        this.render();
    }

    mapDraw() {
        // 绘制地图
        this.map.clear();
        this.mapDrawBuildings();
        this.mapDrawLandmarks();
        this.mapDrawRoads();
        this.mapDrawWater();
    }

    mapDrawBuildings(buildings = store.allBuildings) {
        // 绘制建筑
        buildings.forEach(item => {
            const { width, height } = item;
            const { x, y } = item.getPosition();
            const color = item.getColor();
            this.map.drawBuilding(x, y, width, height, color);
        });
    }

    mapDrawLandmarks(landmarks = store.allLandmarks) {
        // 绘制地标建筑
        landmarks.forEach(item => {
            const { type, width, topWidth = 0 } = item;
            const halfW = (topWidth - width) / 2;
            const { x, y } = item.getPosition();
            const color = item.getColor();
            this.map.drawLandmark(type, width >= topWidth ? x : x - halfW, y, Math.max(width, (topWidth || 0)), color);
        });
    }

    createLandmark() {
        // 创建landmark 
        let { width, tall: height, type, color, topWidth, segment } = store.landmarkCreate;
        topWidth = type === 'cylinder' ? topWidth : 0;
        if(width < 0 || height < 0 || topWidth < 0) {
            alert("请输入大于0的值");
        }
        if(segment < 3) {
            alert("请输入不小于3的值");
        }
        this.createHelper.show({ width, height, topWidth, type, segment }, (x, y) => {
            const building = new Landmark({ width, height, type, color, topWidth, segment });
            const halfW = (topWidth - width) / 2;
            building.setPosition(width >= topWidth ? x : x + halfW, y);
            building.addToScene(this.scene);
            store.allLandmarks = [...store.allLandmarks, building];
        });
    }

    mapDrawRoads(roads = store.allRoads) {
        // 绘制道路
        roads.forEach(item => {
            const { width, realHeight, angle } = item;
            const { x, y } = item.getPosition();
            const color = item.getColor();
            this.map.drawClash(x, y, width, realHeight, angle, color);
        });
    }

    mapDrawWater(water = store.allWater) {
        // 绘制水
        water.forEach(item => {
            const { width, realHeight, angle } = item;
            const { x, y } = item.getPosition();
            const color = item.getColor();
            this.map.drawClash(x, y, width, realHeight, angle, color);
        });
    }

}

new App();
