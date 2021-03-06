import store from '../common/store.js';
import BasicObject from './BasicObject.js';

export default class CreateHelper extends BasicObject {

    constructor(app) {
        super();
        this.app = app;
        this.depth = 2;
    }

    static COLOR = {
        SUC: '#2bad09',
        ERR: '#ff0000'
    };

    show({
        width,
        height,
        topWidth,
        segment,
        type = 'cuboid'
    } = {}, callback = () => {}) {
        // ηζεΊι’
        this.hide();
        this.type = type;

        if (type === 'cuboid') {
            this.width = width;
            this.height = height;
            this.geometry = new THREE.PlaneGeometry(width, height);
        }
        if ([ 'sphere'].includes(type)) {
            this.width = width;
            this.height = width;
            this.geometry = new THREE.CircleGeometry(width/2, width);
        }
        // if (['cone'].includes(type)) {
        //     this.width = width;
        //     this.segment = segment;
        //     this.geometry = new THREE.CircleGeometry(width/2, segment);
        // }
        // if (['cylinder'].includes(type)) {
        //     this.width = Math.max(width, topWidth || 0);
        //     this.height = width;
        //     this.geometry = new THREE.CircleGeometry(width/2, width);
        // }
        if (['cylinder', 'cone'].includes(type)) {
            this.width = Math.max(width, topWidth || 0);
            this.height = this.width;
            this.geometry = new THREE.CylinderGeometry(this.width / 2, this.width / 2, 1);
        }
        if (type === 'clash') {
            this.points = [];
            this.clickTime = 0;
            this.width = width;
            this.height = width;
            this.geometry = new THREE.PlaneGeometry(this.width, this.width);
        }
        this.material = new THREE.MeshBasicMaterial({ color: CreateHelper.COLOR.SUC });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.app.scene.add(this.mesh);
        this.bindEvents();
        this.callback = callback;
    }

    hide() {
        // ιθεΊι’
        this.canCick = false;
        if (this.mesh) {
            this.mesh.rotation.set(0, 0, 0);
        }
        this.app.scene.remove(this.mesh);
        this.app.render();
        this.removeEvents();
    }

    bindEvents() {
        // η»ε?δΊδ»Ά
        if (['cuboid', 'sphere', 'cylinder', 'cone'].includes(this.type)) {
            this.mousemove = this.handleMouseMove();
            this.click = this.handleClick.bind(this);
        }
        if (this.type === 'clash') {
            // ζηΊΏ
            this.mousemove = this.handleMouseMove();
            this.click = this.handleClashClick.bind(this);
        }
        window.addEventListener('click', this.click, false);
        window.addEventListener('mousemove', this.mousemove, false);
    }

    removeEvents() {
        // η§»ι€δΊδ»Ά
        window.removeEventListener('mousemove', this.mousemove);
        window.removeEventListener('click', this.click);
    }
    
    handleMouseMove() {
        // ιΌ ζ ζ»ε¨δΊδ»Ά
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const { cWidth, cHeight } = store.planet;
        const maxW = cWidth - this.width;
        const maxH = cWidth - this.height;
        return event => {
            if (this.app.planetCuboid) {
                this.canCick = true;
                mouse.x = (event.clientX / this.app.width) * 2 - 1;
                mouse.y = - (event.clientY / this.app.height) * 2 + 1;
                raycaster.setFromCamera(mouse, this.app.camera);
                const intersects = raycaster.intersectObjects([this.app.planetCuboid.mesh]);
                this.canCick = false;
                if (intersects && intersects.length) {
                    const { x, y } = intersects[0].point;
                    let rx = x + cWidth / 2 - this.width / 2;
                    let ry = cHeight / 2 - y - this.height / 2;
                    rx = rx < 0 ? 0 : rx;
                    rx = rx > maxW ? maxW : rx;
                    ry = ry < 0 ? 0 : ry;
                    ry = ry > maxH ? maxH : ry;
                    this.setPosition(rx, ry);
                    this.rx = rx;
                    this.ry = ry;
                    if (['cone', 'cylinder'].includes(this.type)) {
                        this.mesh.rotation.set(Math.PI / 2, 0, 0);
                    }
                    if (this.type === 'clash' && this.clickTime) {
                        const [startPoint] = this.points;
                        const point = new THREE.Vector2(this.rx, this.ry);
                        this.points[this.clickTime] = point;
                        const height = point.distanceTo(startPoint);
                        this.mesh.scale.set(1, height / this.height, 1);
                        const symb = startPoint.y - point.y > 0 ? -1 : 1;
                        const angle = symb * Math.asin((point.x - startPoint.x) / height);
                        this.mesh.rotation.set(0, 0, angle);

                        rx = (startPoint.x + point.x + 2) / 2;
                        ry = (startPoint.y + point.y + 2) / 2;
                        this.setPosition(rx, ry);
                        this.rx = rx;
                        this.ry = ry;
                        this.angle = angle;
                        this.clashHeight = height;
                    }
                    
                    this.canCick = this.isOverObjects();
                    this.material.color = this.canCick
                        ? new THREE.Color(CreateHelper.COLOR.SUC)
                        : new THREE.Color(CreateHelper.COLOR.ERR);
                    this.app.render();
                }
            }
        };
    }

    handleClick() {
        // ηΉε»δΊδ»Ά
        if (!this.canCick) {
            return;
        }
        this.callback(this.rx, this.ry);
        this.hide();
    }

    handleClashClick() {
        // ε½δΈΊζηΊΏζΆηΉε»δΊδ»Ά
        if (!this.canCick) {
            return;
        }
        if (!this.clickTime) {
            this.points.push(new THREE.Vector2(this.rx, this.ry));
        } else {
            this.callback(this.rx, this.ry, this.clashHeight, this.angle);
            this.hide();
        }

        this.clickTime++;
    }

    isOverObjects() {
        // ζ―ε¦ε½εδ½η½?ζ―ε¦ζε»Ίη­
        let params = {};
        if (!this.type || ['cuboid', 'sphere'].includes(this.type) || (this.type === 'clash' && !this.clickTime)) {
            params = {
                width: this.width,
                height: this.height
            }
        }
        if (['cylinder', 'cone'].includes(this.type)) {
            params = {
                width: this.width
            }
        }
        if (this.type === 'clash' && this.clickTime) {
            params = {
                width: this.width,
                height: this.clashHeight,
                angle: this.angle
            }
        }
        
        const curPoints = CreateHelper.getPlyByType(this.type, this.mesh.position.x, this.mesh.position.y, params);
        return store.allObjects.every(item => {
            let params = {};
            if (!item.type || ['cuboid', 'sphere'].includes(item.type)) {
                params = {
                    width: item.width,
                    height: item.height
                };
            }
            if (['cylinder', 'cone'].includes(item.type)) {
                params = {
                    width: Math.max(item.width, item.topWidth || 0)
                };
            }
            if (item.type === 'clash') {
                params = {
                    width: item.width,
                    height: item.realHeight,
                    angle: item.angle
                };
            }
            const itemPoints = CreateHelper.getPlyByType(item.type, item.mesh.position.x, item.mesh.position.y, params);
            return !CreateHelper.isPolygonsOverlap(itemPoints, curPoints);
        });
    }

    static getPlyByType(type, x, y, params) {
        // ηζεΉ³ι’εΎε½’ηηΉεζ 
        if (!type || ['cuboid', 'sphere'].includes(type) || (type === 'clash' && !params.angle)) {
            // η«ζΉδ½
            const halfW = params.width / 2;
            const halfH = type === 'clash'
                ? halfW
                : (params.height / 2);
            return [
                { x: x - halfW, y: y + halfH },
                { x: x + halfW, y: y + halfH },
                { x: x + halfW, y: y - halfH },
                { x: x - halfW, y: y - halfH }
            ];
        }

        if (type === 'clash') {
            // εΎζηη«ζΉδ½
            const { width, height, angle } = params;
            const halfW = width / 2;
            const halfH = height / 2;
            const startPoint = {
                x: x + halfH * Math.sin(angle),
                y: y - halfH * Math.cos(angle)
            };
            const endPoint = {
                x: x - halfH * Math.sin(angle),
                y: y + halfH * Math.cos(angle)
            };
            const rx = halfW * Math.sin(Math.PI / 2 + angle);
            const ry = halfW * Math.cos(Math.PI / 2 + angle);
            return [
                { x: endPoint.x - rx, y: endPoint.y + ry },
                { x: startPoint.x - rx, y: startPoint.y + ry },
                { x: startPoint.x + rx, y: startPoint.y - ry },
                { x: endPoint.x + rx, y: endPoint.y - ry }
            ];
        }

        if (['cylinder', 'cone'].includes(type)) {
            // ε€θΎΉε½’
            const halfW = params.width / 2;
            const res = [];
            for (let i = 0; i < 8; i++) {
                const angle = Math.PI * 2 * i / 8;
                res.push({ x: x + halfW * Math.cos(angle), y: y + halfW * Math.sin(angle) });
            }

            return res;
        }
    }

    static isPolygonsOverlap(plyA, plyB) {
        // ε€ζ­δΈ€δΈͺε€θΎΉε½’ζ―ε¦ηΈδΊ€
        // ηΉ: { x: xxx, y: xxx }
        // ηΊΏ: [{ x: xxx, y: xxx }, { x: xxx, y: xxx }]
        // ι’: [{ x: xxx, y: xxx }, { x: xxx, y: xxx }, { x: xxx, y: xxx }...]
        return CreateHelper.isPolygonsIntersectant(plyA, plyB) || CreateHelper.isPointInPolygonBidirectional(plyA, plyB);
    }

    static isSegmentsIntersectant(segA, segB) {
        // ε€ζ­ηΊΏηΊΏζ―ε¦ηΈδΊ€
        const abc = (segA[0].x - segB[0].x) * (segA[1].y - segB[0].y) - (segA[0].y - segB[0].y) * (segA[1].x - segB[0].x);
        const abd = (segA[0].x - segB[1].x) * (segA[1].y - segB[1].y) - (segA[0].y - segB[1].y) * (segA[1].x - segB[1].x);
        if (abc * abd >= 0) {
            return false;
        }
        const cda = (segB[0].x - segA[0].x) * (segB[1].y - segA[0].y) - (segB[0].y - segA[0].y) * (segB[1].x - segA[0].x);
        const cdb = cda + abc - abd;
        return !(cda * cdb >= 0);
    }

    static isPolygonsIntersectant(plyA, plyB) {
        // ε€ζ­ι’ι’ζ―ε¦ηΈδΊ€
        for (let i = 0, il = plyA.length; i < il; i++) {
            for (let j = 0, jl = plyB.length; j < jl; j++) {
                const segA = [plyA[i], plyA[i === il - 1 ? 0 : i + 1]];
                const segB = [plyB[j], plyB[j === jl - 1 ? 0 : j + 1]];
                if (CreateHelper.isSegmentsIntersectant(segA, segB)) {
                    return true;
                }
            }
        }
        return false;
    }

    static isPointInPolygon(point, polygon) {
        // ηΉζ―ε¦ε¨ε¦δΈεΉ³ι’δΈ­
        //δΈθΏ°δ»£η ζ₯ζΊοΌhttp://paulbourke.net/geometry/insidepoly/οΌθΏθ‘δΊι¨εδΏ?ζΉ
        //εΊζ¬ζζ³ζ―ε©η¨ε°ηΊΏζ³οΌθ?‘η?ε°ηΊΏδΈε€θΎΉε½’εθΎΉηδΊ€ηΉοΌε¦ζζ―εΆζ°οΌεηΉε¨ε€θΎΉε½’ε€οΌε¦ε
        //ε¨ε€θΎΉε½’εγθΏδΌθθδΈδΊηΉζ?ζε΅οΌε¦ηΉε¨ε€θΎΉε½’ι‘ΆηΉδΈοΌηΉε¨ε€θΎΉε½’θΎΉδΈη­ηΉζ?ζε΅γ
    
        var N = polygon.length;
        var boundOrVertex = true; //ε¦ζηΉδ½δΊε€θΎΉε½’ηι‘ΆηΉζθΎΉδΈοΌδΉη?εηΉε¨ε€θΎΉε½’εοΌη΄ζ₯θΏεtrue
        var intersectCount = 0; //cross points count of x 
        var precision = 2e-10; //ζ΅?ηΉη±»εθ?‘η?ζΆεδΈ0ζ―θΎζΆεηε?Ήε·?
        var p1, p2; //neighbour bound vertices
        var p = point; //ζ΅θ―ηΉ
    
        p1 = polygon[0]; //left vertex        
        for (var i = 1; i <= N; ++i) { //check all rays            
            if (p.x == p1.x && p.y == p1.y) {
                return boundOrVertex; //p is an vertex
            }
    
            p2 = polygon[i % N]; //right vertex            
            if (p.y < Math.min(p1.y, p2.y) || p.y > Math.max(p1.y, p2.y)) { //ray is outside of our interests                
                p1 = p2;
                continue; //next ray left point
            }
    
            if (p.y > Math.min(p1.y, p2.y) && p.y < Math.max(p1.y, p2.y)) { //ray is crossing over by the algorithm (common part of)
                if (p.x <= Math.max(p1.x, p2.x)) { //x is before of ray                    
                    if (p1.y == p2.y && p.x >= Math.min(p1.x, p2.x)) { //overlies on a horizontal ray
                        return boundOrVertex;
                    }
    
                    if (p1.x == p2.x) { //ray is vertical                        
                        if (p1.x == p.x) { //overlies on a vertical ray
                            return boundOrVertex;
                        } else { //before ray
                            ++intersectCount;
                        }
                    } else { //cross point on the left side                        
                        var xinters = (p.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x; //cross point of x                        
                        if (Math.abs(p.x - xinters) < precision) { //overlies on a ray
                            return boundOrVertex;
                        }
    
                        if (p.x < xinters) { //before ray
                            ++intersectCount;
                        }
                    }
                }
            } else { //special case when ray is crossing through the vertex                
                if (p.y == p2.y && p.x <= p2.x) { //p crossing over p2                    
                    var p3 = polygon[(i + 1) % N]; //next vertex                    
                    if (p.y >= Math.min(p1.y, p3.y) && p.y <= Math.max(p1.y, p3.y)) { //p.y lies between p1.y & p3.y
                        ++intersectCount;
                    } else {
                        intersectCount += 2;
                    }
                }
            }
            p1 = p2; //next ray left point
        }
    
        if (intersectCount % 2 == 0) { //εΆζ°ε¨ε€θΎΉε½’ε€
            return false;
        } else { //ε₯ζ°ε¨ε€θΎΉε½’ε
            return true;
        }
    }

    static isPointInPolygonBidirectional(plyA, plyB) {
        //ι’ι’
        let [a, b] = [false, false];
        a = plyA.some(item => CreateHelper.isPointInPolygon(item, plyB));
        if (!a) {
            b = plyB.some(item => CreateHelper.isPointInPolygon(item, plyA));
        }
        return a || b;
    }

}
