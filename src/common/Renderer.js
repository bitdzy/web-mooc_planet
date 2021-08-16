export default class Renderer extends THREE.WebGLRenderer {

    /**
     * @description: 渲染器二次封装
     *               https://threejs.org/docs/index.html?q=WebGLRenderer#api/zh/renderers/WebGLRenderer
     * @param {Array?:null} size setSize的三个参数， 当为null的时候默认是父元素的大小
     * @param {parent?:HTMLElement} parent 父元素dom
     * @param {key-value} params THREE.WebGLRenderer构造函数需要的参数
     */
    constructor({
        size = null,
        parent = document.body,
        ...params
    } = {}) {
        super(params);
        // 设置画布大小
        this.setSizeOverride(parent, size);
        // 将元素渲染到父元素中
        parent.appendChild(this.domElement);
    }

    /**
     * @description: 重写setSize方法
     * @param {parent?:HTMLElement} parent
     * @param {Array?:null} size
     */
    setSizeOverride(parent, size) {
        let width, height, updateStyle;
        const { width: pWidth, height: pHeight } = parent.getBoundingClientRect();
        width = pWidth;
        height = pHeight;
        updateStyle = true;
        if (Array.isArray(size)) {
          width = size[0] || pWidth;
          height = size[1] || pHeight;
          if (typeof size[3] === 'boolean') {
            updateStyle = size[3];
          }
        }
        this.setSize(width, height, updateStyle);
    }

}

