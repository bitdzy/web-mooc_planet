import BasicObject from '../common/BasicObject.js';
import { modelA1, modelA2, modelB1, modelB2 } from '../components/Cloud_model/model.js';

export default class Cloud extends BasicObject {

    constructor(type) {
        super();
        //初始化setposition方法参数
        this.width = 1; this.height = 1; this.depth = 1;
        this.type=type;

        //使用ObjectLoader对象导入云模组
        const loader = new THREE.ObjectLoader();
        this.mesh = loader.parse(this.setShape(this.type));

        // 把mash的属性暴露在类属性中提供给BasicObject使用
        this.material = this.mesh.material;

        // 调整云朵基础位置，大小，角度
        this.mesh.geometry.rotateX(Math.PI / 2);
        this.mesh.geometry.scale(0.25, 0.25, 0.25);

    }

    setRandrotation() {
        // 设置云朵随机旋转角度
        this.mesh.geometry.rotateZ(Math.random() * Math.PI);
    }
    
    setShape(type) {
        // 设置云朵种类，随机形状
        let index = Math.random();
        let content;
        switch (type) {
           case 0:
                if (index > 0.5) {
                    content = modelA1;
                } else {
                    content = modelA2;
                }
               break;
            default:
                if (index > 0.5) {
                    content = modelB1;
                } else {
                    content = modelB2;
                }
                break;
        }
        return content;
    }

}
