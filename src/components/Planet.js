import store from '../common/store.js';
import BasicObject from "../common/BasicObject.js";

export default class Planet extends BasicObject {

    constructor({ color = '#c2ebb6' } = {}) {
        super();
        this.geometry = new THREE.SphereGeometry(180 * 2 / Math.PI, 120, 120);
        this.material = new THREE.MeshLambertMaterial({ color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

}