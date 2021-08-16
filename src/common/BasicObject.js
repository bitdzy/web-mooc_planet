import store from '../common/store.js';

export default class BasicObject {

    addToScene(scene) {
        // 将网格添加到场景中
        scene.add(this.mesh);
    }

    visible() {
        // 显示
        this.material.visible = true;
    }

    invisible() {
        // 隐藏
        this.material.visible = false;
    }

    updateColor(color) {
        // 改变颜色
        this.material.color = new THREE.Color(color);
    }

    getColor() {
        // 获取颜色
        return '#' + this.material.color.getHexString();
    }

    getPosition() {
        // 获取位置信息
        return { x: this._x, y: this._y, z: this._z };
    }

    setPosition(x = this._x, y = this._y, z = (this._z || 0)) {
        // 设置位置
        this._x = x;
        this._y = y;
        this._z = z;
        const { depth: cDepth, cWidth, cHeight } = store.planet;
        x = -cWidth / 2 + this.width / 2 + x;
        y = cHeight / 2 - this.height / 2 - y;
        z = cDepth / 2 + this.depth / 2 + z;
        this.mesh.position.set(x, y, z);
    }

    setPositionOnSphere() {
        const lng = this._x - 180;
        const lat = this._y - 180;
        const radius = 180 * 2 / Math.PI;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));
        
        const a = Math.sqrt(
            Math.pow(x, 2) + Math.pow(y, 2)
        );
        const b = Math.sqrt(
            Math.pow(x, 2) + Math.pow(z, 2)
        );
        console.log((-y) / Math.abs(y) * Math.acos(y / a));
        // this.mesh.rotation.z = Math.PI * 2 +  -x / Math.abs(x) * Math.asin(y / a);
        // this.mesh.rotation.y = Math.PI / 2 + (-x) / Math.abs(x) * Math.asin(z / b);
        // this.mesh.rotation.z = Math.PI * 2 +  x / Math.abs(x) * Math.asin(y / a);
        // this.mesh.rotateX(Math.PI * 2 +  -x / Math.abs(x) * Math.asin(y / a))
        // this.mesh.rotation.x = Math.PI * 2 +  -x / Math.abs(x) * Math.asin(y / a);
        // this.mesh.rotation.z = Math.PI * 2 + (-x) / Math.abs(x) * Math.asin(y / a);
        let aa, bb;
        if (x > 0) {
            aa = y > 0
                ? Math.PI * 2 + Math.asin(y / a)
                : Math.PI * 2 - Math.asin(Math.abs(y) / a);
            bb = z > 0
                ? Math.PI * 2 - Math.asin(z / b)
                : Math.PI * 2 + Math.asin(Math.abs(z) / b);
        }
        if (x < 0) {
            aa = y > 0
                ? Math.PI - Math.asin(y / a)
                : Math.PI + Math.asin(Math.abs(y) / a);
            bb = z > 0
                ? Math.PI - Math.asin(z / a)
                : Math.PI + Math.asin(Math.abs(z) / a);
        }
        // this.mesh.rotation.y = bb + Math.PI / 2;
        // this.mesh.rotateY(aa + Math.PI / 2);
        // this.mesh.rotateX(bb);
        this.mesh.lookAt(x, y, z);
        // this.mesh.rotation.z = aa;
        this.mesh.position.set(x + 380, y, z);
    }

}
