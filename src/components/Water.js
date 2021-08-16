import BasicObject from '../common/BasicObject.js';
import store from '../common/store.js';

export default class Water extends BasicObject {

    constructor({ 
        color = store.water.color,
        texture = store.textureWater,
        width,
        height,
        depth = store.waterCreate.depth,
        showMap = store.waterCreate.showMap,
        type = 'clash',
        angle
    } = {}) {
        super();
        this.type = type;
        this.width = width;
        this.height = width;
        this.depth = depth;
        this.realHeight = height;  
        if (showMap) {
            this.material = new THREE.MeshLambertMaterial({ color, map: texture });
        } else {
            this.material = new THREE.MeshLambertMaterial({ color });
        }
        if (type === 'clash') {
            this.geometry = new THREE.BoxGeometry(width, width, depth);
        }
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.scale.set(1, height / this.height, 1);
        if (angle) {
            this.mesh.rotation.set(0, 0, angle);
            this.angle = angle;
        }
    }

}