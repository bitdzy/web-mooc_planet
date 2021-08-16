import store from '../common/store.js';
import CreateHelper from '../common/CreateHelper.js';

export default class Map {

    constructor({
        el = document.getElementById('map_cas')
    } = {}) {
        if (Object.prototype.toString.call(el) === '[object HTMLDivElement]') {
            this.$wrap = el;
            this.$parent = this.$wrap.parentNode;
        }
        if (!this.$wrap) {
            console.error('xxxxxxx');
            return;
        }
        const { width: wrapWidth, height: wrapHeight } = this.$wrap.getBoundingClientRect();
        const { width: parentWidth, height: parentHeight } = this.$parent.getBoundingClientRect();
        this.wrapWidth = wrapWidth;
        this.wrapHeight = wrapHeight;
        this.parentWidth = parentWidth;
        this.parentHeight = parentHeight;
        this.planetWidth = store.planet.cWidth;
        this.planetHeight = store.planet.cHeight;
        this.multWidth = this.wrapWidth / this.planetWidth;
        this.multHeight = this.wrapHeight / this.planetHeight;
        this.$canvas = this.genCanvas();
        this.ctx = this.$canvas.getContext('2d');
        this.$wrap.appendChild(this.$canvas);
        this.bindDOM();
        this.bindEvents();
        this.setPosition(0, 0);
    }

    bindDOM() {
        // 绑定DOM
        this.$lng = document.getElementById('lng');
        this.$lat = document.getElementById('lat');
        this.$locate = document.getElementById('locate');
    }

    bindEvents() {
        // 绑定事件
        let isMouseDown = false;
        let startX = 0;
        let startY = 0;
        this.$wrap.addEventListener('mousedown' , event => {
          startX = event.clientX;
          startY = event.clientY;
          isMouseDown = true;
        });
        this.$wrap.addEventListener('mouseup' , () => {
            isMouseDown = false;
        });
        this.$wrap.addEventListener('mousemove' , event => {
            if (isMouseDown) {
                const { clientX, clientY } = event;
                const lng = -(clientX - startX) * .3;
                const lat = -(clientY - startY) * .3;
                startX = clientX;
                startY = clientY;
              this.setPosition(this.lng + lng, this.lat + lat);
            }
        });
        this.$locate.addEventListener('click', () => {
            this.setPosition(Number(this.$lng.value), Number(this.$lat.value));
        });
    }

    bindSubscribe() {
        // 绑定订阅
        store.subscribe('lng', val => {
            this.$lng.value = val;
        });
        store.subscribe('lat', val => {
            this.$lat.value = val;
        });
    }

    setPosition(lng, lat) {
        // 设置经纬度
        if (lng < -180) {
            lng = -180;
        }
        if (lng > 180 - this.parentWidth / 4) {
            lng = 180 - this.parentWidth / 4;
        }
        if (lat < -180) {
            lat = -180;
        }
        if (lat > 180 - this.parentHeight / 4) {
            lat = 180 - this.parentHeight / 4;
        }
        let left = -(this.planetWidth / 2 + lng) * this.multWidth;
        let top = -(this.planetHeight / 2 + lat) * this.multHeight;
        this.$wrap.style.top = top + 'px';
        this.$wrap.style.left = left + 'px';
        this.lng = lng;
        this.lat = lat;
        this.$lng.value = lng;
        this.$lat.value = lat;
    }

    genCanvas() {
        // 生成canvas
        const $canvas = document.createElement('canvas');
        // 设置canvas的宽高
        $canvas.width = this.planetWidth;
        $canvas.height = this.planetHeight;
        $canvas.style.width = this.wrapWidth + 'px';
        $canvas.style.height = this.wrapHeight + 'px';
        return $canvas;
    }

    clear() {
        // 清空canvas
        const { width, height } = this.$canvas;
        this.ctx.clearRect(0, 0, width, height);
    }

    drawBuilding(x, y, width, height, color) {
        // 绘制建筑
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.closePath();
    }

    drawLandmark(type, x, y, width, color) {
        // 绘制地标
        this.ctx.beginPath();
        if (type === 'sphere') {
            this.ctx.arc(x + width / 2, y + width / 2, width / 2, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
        if (['cylinder', 'cone'].includes(type)) {
            const points = CreateHelper.getPlyByType(type, x + width / 2, y + width / 2, { width });
            points.forEach((item, index) => {
                if (!index) {
                    this.ctx.moveTo(item.x, item.y);
                } else {
                    this.ctx.lineTo(item.x, item.y);
                }
            });
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
        this.ctx.closePath();
    }

    drawClash(x, y, width, height, angle, color) {
        // 绘制路
        this.ctx.beginPath();
        const points = CreateHelper.getPlyByType('clash', x + width / 2, y + width / 2, { width, height, angle: -angle });
        points.forEach((item, index) => {
            if (!index) {
                this.ctx.moveTo(item.x, item.y);
            } else {
                this.ctx.lineTo(item.x, item.y);
            }
        });
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    }

}
