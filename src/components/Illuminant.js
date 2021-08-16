import BasicObject from '../common/BasicObject.js';

export default class Illuminant extends BasicObject {
  constructor({ color = 0xffffff } = {}) {
    super();
    this.mesh = new THREE.SpotLight(color);
  }

  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z)
  }

  // 设置阴影
  setAllShaepShallow(allShapeList) {
    for (let shape of allShapeList) {
      if (shape instanceof THREE.WebGLRenderer) { // 在场景中使用阴影贴图
        console.log(1);
        shape.shadowMap.enabled = true
      } else {
        if (shape.receiveShadow) {
          shape.receiveShadow = true
        } else {
          shape.castShadow = true
        }
      }
    }
  }
  updateIlluminant(){
    //更新光源位置
    const time = Date.now()*0.1;
    this.mesh.position.x = Math.cos( time * 0.001 ) * 700;
    this.mesh.position.y = Math.sin( time * 0.001 ) * -700;

  }

}
