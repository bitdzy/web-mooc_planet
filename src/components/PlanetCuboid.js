import store from '../common/store.js';
import BasicObject from '../common/BasicObject.js';

export default class PlanetCuboid extends BasicObject {

    constructor({ 
        color = store.planet.color,
        width = store.planet.cWidth,
        height = store.planet.cHeight,
        depth = store.planet.depth,
        texture = store.texturePlanet
    } = {}) {
        super();
        this.initDepth = depth; 
        this.material = new THREE.MeshLambertMaterial({ color, map: texture });
        this.geometry = new THREE.BoxGeometry(width, height, depth);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    updateDepth(depth) {
        // 更新厚度
        this.mesh.scale.set(1, 1, depth / this.initDepth);
    }

}
