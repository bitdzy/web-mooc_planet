/**
 * @description: 发布订阅模式
 */
class PubSub {

    constructor() {
        this._prevData = {};
        this._publisher = new Map();
    }

    publish(key) {
        // 发布
        // 找到所有的订阅
        const funcMapArr = [...this._publisher.entries()].filter(item => 
            item[0] === key || item[0].startsWith(key + '.')
        );
        if (!funcMapArr.length) {
            return;
        }
        funcMapArr.forEach(([key, value]) => {
            if (!key.includes('.')) {
                // key为正常情况
                if (!isObj(this[key]) && this._prevData[key] === this[key]) {
                    return;
                }
                this.fireFunction(value, this[key]);
            } else {
                // key 为xxx.xx
                // 这里不用eval，避免安全问题
                const keyArr = key.split('.');
                let curKey = keyArr.shift();
                let dataCur = this[curKey];
                let dataPrev = this._prevData[curKey];
                while(curKey = keyArr.shift()) {
                    if (dataCur) {
                        dataCur = dataCur[curKey]
                    }
                    if (dataPrev) {
                        dataPrev = dataPrev[curKey]
                    }
                }
                if(!isObj(dataCur) && dataCur === dataPrev) {
                    return;
                }
                this.fireFunction(value, dataCur);
            }
        });
        key = key.split('.')[0];
        this._prevData[key] = deepClone(this[key]);

    }

    subscribe(key, func, first) {
        // 订阅
        if (!this._publisher.has(key)) {
            this._publisher.set(key, new Map());
        }
        
        const id = generateUUID();
        this._publisher.get(key).set(id, func);
        if (first) {
            // 首次执行
            this.publish(key);
        }
        return id;
    }

    unsubscribe(id) {
        // 取消订阅
        [...this._publisher.values()].forEach(item => {
            if (item.has(id)) {
                item.delete(id);
            }
        });
    }

    fireFunction(maps, value) {
        // publish 私有函数，执行publisher中的方法
        [...maps.values()].forEach(item => {
            if (typeof item !== 'function') {
                return;
            }

            item.call(item, value);
        });
    }
}

/**
 * @description: 生成UUID
 * @return {String}
 */
function generateUUID() {
    let d = new Date().getTime();
    if (window.performance && typeof window.performance.now === 'function') {
        d += performance.now();
    }
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

/**
 * @description: deepClone的子函数。
 * @param {any}} o
 * @return {any}
 */
function getEmpty(o){
	if(Object.prototype.toString.call(o) === '[object Object]'){
		return {};
	}
	if(Object.prototype.toString.call(o) === '[object Array]'){
		return [];
	}
	return o;
}

/**
 * @description: DFS实现深拷贝
 * @param {any} origin
 * @return {any}
 */
function deepClone(origin) {
    let stack = [];
	let map = new Map();

	let target = getEmpty(origin);
	if(target !== origin){
		stack.push([origin, target]);
		map.set(origin, target);
	}

	while(stack.length){
		let [ori, tar] = stack.pop();
		for(let key in ori){
			// 处理环状
			if(map.get(ori[key])){
				tar[key] = map.get(ori[key]);
				continue;
			}

			tar[key] = getEmpty(ori[key]);
			if(tar[key] !== ori[key]){
				stack.push([ori[key], tar[key]]);
				map.set(ori[key], tar[key]);
			}
		}
	}

	return target;
}

/**
 * @description: 判断是否为对象
 * @param {Object} obj
 * @return {Boolean}
 */
 function isObj(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

export { PubSub, generateUUID, deepClone, isObj };
