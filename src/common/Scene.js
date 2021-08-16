export default class Scene extends THREE.Scene {

    /**
     * @description: 场景的二次封装
     *               https://threejs.org/docs/index.html?q=scene#api/zh/scenes/Scene.background
     * @param {Boolean?:true} autoUpdate
     * @param {Object?:new THREE.Color(0x000000)} background
     * @param {Texture?:null} environment
     * @param {Fog?:null} fog
     * @param {Material?:null} overrideMaterial
     */
    constructor({
        autoUpdate = true,
        background = new THREE.Color(0x000000),
        environment = null,
        fog = null,
        overrideMaterial = null
    } = {}) {
        super();
        this.autoUpdate = autoUpdate;
        this.background = background;
        this.environment = environment;
        this.fog = fog;
        this.overrideMaterial = overrideMaterial;
    }

}
