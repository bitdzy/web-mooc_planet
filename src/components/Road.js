import store from '../common/store.js';
import BasicObject from '../common/BasicObject.js';

export default class Road extends BasicObject {

    constructor({ 
        color = store.roads.color,
        texture = store.textureRoad,
        width,
        height,
        depth = 1,
        type = 'clash',
        showMap = store.roadCreate.showMap,
        angle
    } = {}) {
        super();
        this.type = type;
        this.width = width;
        this.height = width;
        this.depth = depth;
        this.realHeight = height;
        if (showMap){
            this.material = new THREE.MeshLambertMaterial({ color, map: texture });
        } else {
            this.material = new THREE.MeshLambertMaterial({ color });
        }
        if (type === 'clash') {
            this.geometry = new THREE.PlaneGeometry(width, width);
        }
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.scale.set(1, height / this.height, 1);
        if (angle) {
            this.mesh.rotation.set(0, 0, angle);
            this.angle = angle;
        }
    }

}