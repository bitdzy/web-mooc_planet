import store from '../common/store.js';
import BasicObject from '../common/BasicObject.js';

export default class Landmark extends BasicObject {

    constructor({ 
        color = store.landmarkCreate.color,
        width,
        topWidth,
        height,
        segment,
        type = 'cylinder'
    } = {}) {
        super();
        //here change landmark type (cuboid/cone/cylinder/sphere)
        this.type = type;
        this.color = color;
        this.material = new THREE.MeshLambertMaterial({ 
            color,
            wireframe: true,
        
        });
        if(type === 'cone') {
            this.width = width;
            this.height = width;
            this.depth = height;
            this.segment = segment;
            //ConeGeometry(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength)
            this.geometry = new THREE.ConeGeometry(this.width / 2, this.depth, this.segment, height / 3, false, 0, Math.PI * 2);
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.rotation.x = Math.PI / 2;
        } else if(type === 'cylinder') {
            this.width = width;
            this.topWidth = topWidth || width;
            this.height = Math.max(this.width, this.topWidth);
            this.depth = height;
            //CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEndedopenEnded底面是否打开，默认false, thetaStart底面第一个三角形切割面的起始位置，默认是0，三点钟方向, thetaLength底面圆心角的大小)
            this.geometry = new THREE.CylinderGeometry(this.topWidth / 2, this.width / 2, height, 8, this.height / 2);
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.rotation.x = Math.PI / 2;
        } else if(type === 'sphere') {
            this.width = width;
            this.height = width;
            this.depth = width;
            //SphereGeometry(radius, widthSegments, heightSegments, phiStart水平方向的其实位置，默认是0，九点钟方向, phiLength水平方向的圆心角，默认是2*PI., thetaStart竖直方向上的起始角度，默认是0，y轴正方向, thetaLength竖直方向上的圆心角，默认是PI)
            this.geometry = new THREE.SphereGeometry(width / 2, 10, 10, Math.PI/4, Math.PI*2, 0, Math.PI );
            this.mesh = new THREE.Mesh(this.geometry, this.material);
        }
    }

}
