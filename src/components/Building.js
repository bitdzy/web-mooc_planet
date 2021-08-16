import store from '../common/store.js';
import BasicObject from '../common/BasicObject.js';

export default class Building extends BasicObject {

    constructor({ 
        color = store.buildings.color,
        texture = store.textureBuilding,
        width,
        height,
        depth,
        showMap = store.buildingCreate.showMap,
        type = 'cuboid'
    } = {}) {
        super();
        this.type === type;
        this.width = width;
        this.height = height;
        this.depth = depth;
        if (showMap){
            this.material = new THREE.MeshLambertMaterial({ color, map: texture });
        } else {
            this.material = new THREE.MeshLambertMaterial({ color });
        }
        if (type == 'cuboid') {
            this.geometry = new THREE.BoxGeometry(width, height, depth);
        }
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

}
