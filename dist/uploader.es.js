function $warn(message) {
    throw new Error(message);
}

class CustomEvent {
    constructor(options) {
        //触发事件
        this.dispatchEvent = function (type, ...args) {
            if (this._events[type]) {
                this._events[type].forEach((cb) => {
                    cb.call(this, ...args);
                });
            }
            return this;
        };
        this._events = {};
        for (let prop in options) {
            this[prop] = options[prop];
        }
    }
    addEventListener(type, listener) {
        this._events[type] = this._events[type] || [];
        !this._events[type].includes(listener) && this._events[type].push(listener);
        return this;
    }
    removeEventListener(type, listener) {
        if (this._events[type].includes(listener)) {
            let pos = this._events[type].indexOf(listener);
            this._events[type].splice(pos, 1);
        }
        else {
            $warn("传入的监听者不存在");
        }
        return this;
    }
}

class Axios {
    constructor() {
        this.loadedSizeArray = [];
        this.totalSize = 0;
        this._events = {};
    }
    sendRequest(url, method, data, options = {}, index, context, dispatchEvent) {
        let xhr = new XMLHttpRequest();
        let p = new Promise((res, rej) => {
            //刚发送http请求时触发loadstart事件
            xhr.upload.onloadstart = (e) => {
                this.totalSize = e.total;
            };
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    dispatchEvent.call(context, "chunkProgress", e.total, e.loaded);
                    this.loadedSizeArray[index] = e.loaded;
                    this._events["fileProgress"] &&
                        this._events["fileProgress"].forEach((cb) => cb.call(this, dispatchEvent));
                }
            };
            //http请求发送结束后触发load事件，--> loadend | abort | end
            xhr.onload = (e) => {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    res({ data: JSON.parse(xhr.responseText), type: "success" });
                }
            };
            xhr.onerror = (e) => {
                rej({ data: xhr.responseText, type: "error" });
            };
            xhr.onabort = (e) => {
                rej({ data: xhr.responseText, type: "abort" });
            };
            xhr.open(method, url);
            for (let key in options) {
                xhr.setRequestHeader(key, options[key]);
            }
            //设置HTTP请求的头部
            xhr.send(data);
        });
        return {
            p: p,
            xhr: xhr
        };
    }
}

class FileUtils extends Axios {
    constructor(file, context, dispatchEvent) {
        super();
        this.tasks = [];
        this.chunks = [];
        this.file = file;
        this.context = context;
        this.dispatchEvent = dispatchEvent;
        this.chunks.push(this.file);
        this._events["fileProgress"] = this._events["fileProgress"] || [];
        this._events["fileProgress"].push((dispatchEvent) => {
            dispatchEvent.call(this.context, "fileProgress", this.file, this.loadedSizeArray.reduce((prev, next) => {
                return (prev = prev + next);
            }));
        });
    }
    // 对file进行切片
    slice(piece) {
        let totalSize = this.file.size;
        let start = 0;
        let chunks = [];
        while (start < totalSize) {
            let end = start + piece;
            chunks.push(this.file.slice(start, end));
            start = end;
        }
        this.chunks = chunks;
    }
    // ToDo： 使用哈希算法获得文件对应的唯一ID
    getFileId() {
        return this.file.name + this.file.size;
    }
    //获取指定的大文件已经传输成功的切片
    getUploadedChunk(context) {
        let record = window.sessionStorage.getItem("$file" + context);
        if (!record)
            return [];
        else
            return JSON.parse(record);
    }
    // 保存已经成功上传的切片
    saveUploadedChunk(context, chunkId) {
        let record = window.sessionStorage.getItem("$file" + context)
            ? JSON.parse(window.sessionStorage.getItem("$file" + context))
            : [];
        record.push(chunkId);
        window.sessionStorage.setItem("$file" + context, JSON.stringify(record));
    }
    addTask(chunkApi, fileApi, dispatchEvent) {
        this.chunks.forEach((chunk, index) => {
            if (!this.getUploadedChunk(this.getFileId()).includes(index + 1)) {
                let form = new FormData();
                form.append("context", this.getFileId()); //chunk具体属于哪一个文件
                form.append("chunk", chunk);
                form.append("chunkId", String(index + 1));
                let { p, xhr } = this.sendRequest(chunkApi, "post", form, {
                    "Content-Type": "multipart/form-data;charset=utf-8",
                }, index, this.context, dispatchEvent);
                p.then((response) => {
                    //走到这说明该分片传输成功
                    this.saveUploadedChunk(this.getFileId(), index + 1);
                    if (response.type === "success") {
                        dispatchEvent.call(this.context, "chunkSuccess", this.file, chunk, index + 1, response.data);
                        dispatchEvent.call(this.context, "chunkComplete", this.file, chunk, index + 1, response.data);
                    }
                }, (err) => {
                    if (err.type === "abort") {
                        dispatchEvent.call(this.context, "chunkAbort", this.file, chunk, index + 1, err.data);
                        dispatchEvent.call(this.context, "chunkComplete", this.file, chunk, index + 1, err.data);
                    }
                    else if (err.type === "error") {
                        dispatchEvent.call(this.context, "chunkError", this.file, chunk, index + 1, err.data);
                        dispatchEvent.call(this.context, "chunkComplete", this.file, chunk, index + 1, err.data);
                    }
                });
                this.tasks.push({ p, xhr });
            }
        });
    }
    triggerTask(dispatchEvent) {
        Promise.allSettled(this.tasks).then((resArry) => {
            for (let res of resArry) {
                if (res.status === "rejected") {
                    return dispatchEvent.call(this.context, "fileComplete", this.file);
                }
            }
            dispatchEvent.call(this.context, "fileComplete", this.file);
            dispatchEvent.call(this.context, "fileSuccess", this.file);
        });
    }
    uploadTask(piece, chunkApi, fileApi, dispatchEvent, ifSendByChunk) {
        if (ifSendByChunk) {
            this.slice(piece);
        }
        this.addTask(chunkApi, fileApi, dispatchEvent);
        this.triggerTask(dispatchEvent);
    }
    //文件上传暂停/取消
    cancelTask() {
        this.tasks.forEach((task, index) => {
            if (!this.getUploadedChunk(this.getFileId()).includes(index + 1)) {
                task.xhr.abort();
            }
        });
    }
}

let message = "欢迎使用大文件传输库UploadeJS，UploaderJS是一款效率极高的文件上传库，具有多种完善配置，关注作者Nova获取更多最新咨询吧";
let a = 'background: #606060; color: #fff; border-radius: 3px 0 0 3px;';
let b = 'background: #1475B2; color: #fff; border-radius: 0 3px 3px 0;';
console.log(`%c UploaderJS: %c ${message}`, a, b);

const idRegx = /\s*#.+/g;
const classNameRegx = /\s*\..+/g;
class Uploader extends CustomEvent {
    constructor(configuration, options = {}) {
        super(options);
        this.configuration = {
            ifSendByChunk: true,
            chunkSize: 1024 * 1024 * 0.1,
            autoUpload: true,
            chunkApi: "",
            fileApi: ""
        };
        this.fileMap = new Map();
        //覆写父类的dispatchEvent方法
        this.dispatchEvent = function (type, ...args) {
            if (this._events[type]) {
                this._events[type].forEach((cb) => cb.call(this, ...args));
            }
        };
        this.configuration = Object.assign(this.configuration, configuration);
        this.init();
    }
    init() {
        let target = this.configuration.target || undefined;
        if (target) {
            this.assign(target);
        }
        this.clearChunkStorage();
    }
    clearChunkStorage() {
        for (let key in window.sessionStorage) {
            if (/^\$file.*/.test(key)) {
                window.sessionStorage.removeItem(key);
            }
        }
    }
    // 在调用该方法之后，类Uploader会托管传入的DOM元素
    assign(target) {
        if (typeof target === "string") {
            //如果用户传入的target是字符串的话，分为两种可能，一是传入id,或者传入className，需要分情况讨论。
            if (idRegx.test(target)) {
                let dom = document.querySelector(target);
                if (!dom) {
                    $warn("无法找到传入的id对应的DOM元素");
                }
                if (dom instanceof HTMLInputElement && dom.type === "file") {
                    this.fileInputElement = dom;
                }
                else {
                    $warn("传入的id对应的DOM元素不是file类型");
                }
            }
            else if (classNameRegx.test(target)) {
                let dom = document.querySelectorAll(target)[0];
                if (!dom) {
                    $warn("无法找到传入的class对应的DOM元素");
                }
                if (dom instanceof HTMLInputElement && dom.type === "file") {
                    this.fileInputElement = dom;
                }
                else {
                    $warn("传入的class对应的DOM元素不是file类型");
                }
            }
            else {
                $warn("传入的target参数类型错误");
            }
        }
        else if (target instanceof HTMLInputElement) {
            if (target.type === "file") {
                this.fileInputElement = target;
            }
            else {
                $warn("传入的DOM元素不是file类型");
            }
        }
        else {
            $warn("传入的target只能为字符串或者DOM元素");
        }
        this.fileInputElement.addEventListener("change", (e) => {
            [...e.target.files].forEach((file) => {
                console.log(file);
                let fileUtils = new FileUtils(file, this, this.dispatchEvent);
                this.fileMap.set(file, fileUtils);
                if (this.configuration.autoUpload) {
                    this.uploadFile(file, this.configuration.ifSendByChunk);
                }
            });
        });
    }
    uploadFile(file, ifSendByChunk = true) {
        if (!this.fileMap.get(file)) {
            return $warn("你输入的文件不存在");
        }
        this.fileMap
            .get(file)
            .uploadTask(this.configuration.chunkSize, this.configuration.chunkApi, this.configuration.fileApi, this.dispatchEvent, ifSendByChunk);
    }
    cancelUploadFile(file) {
        if (!this.fileMap.get(file)) {
            return $warn("你输入的文件不存在");
        }
        this.fileMap.get(file).cancelTask();
    }
}

export { Uploader as default };
