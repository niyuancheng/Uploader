import { UploaderOptions } from "./type/UploaderOptions";
import $warn from "./utils/warn";
import CustomEvent from "./event/CustomEvent";
import { BaseOptions } from "./event/BaseOptions";
import { EventTypes, EventFunction } from "./event/EventTypes";
import FileUtils from "./utils/file";
import "./utils/console";

const idRegx: RegExp = /\s*#.+/g;
const classNameRegx: RegExp = /\s*\..+/g;

class Uploader extends CustomEvent {
  private configuration: UploaderOptions = {
    ifSendByChunk: true,
    chunkSize: 1024 * 1024 * 0.1,
    autoUpload: true,
    workerPath: "/hash_worker.js",
    chunkApi:"",
    fileApi:""
  };
  private fileInputElement: HTMLInputElement | undefined;
  private fileMap: Map<File, FileUtils> = new Map<File, FileUtils>();
  private lastUploadTime: number = 0;
  private gapTime: number = 0;
  
  constructor(configuration: UploaderOptions, options: BaseOptions = {}) {
    super(options);
    this.configuration = Object.assign(this.configuration,configuration);
    this.init();
  }

  init() {
    let target = this.configuration.target || undefined;
    if (target) {
      this.assign(target);
    }
    this.clearChunkStorage();
    this.showProgress();
  }

  clearChunkStorage(): void {
    for(let key in window.sessionStorage) {
      if(/^\$file.*/.test(key)) {
        window.sessionStorage.removeItem(key);
      }
    }
  }

  // 在调用该方法之后，类Uploader会托管传入的DOM元素
  assign(target: string | HTMLInputElement): void | never {
    if (typeof target === "string") {
      //如果用户传入的target是字符串的话，分为两种可能，一是传入id,或者传入className，需要分情况讨论。
      if (idRegx.test(target)) {
        let dom = document.querySelector(target);
        if (!dom) {
          $warn("无法找到传入的id对应的DOM元素");
        }
        if (dom instanceof HTMLInputElement && dom.type === "file") {
          this.fileInputElement = dom;
        } else {
          $warn("传入的id对应的DOM元素不是file类型");
        }
      } else if (classNameRegx.test(target)) {
        let dom = document.querySelectorAll(target)[0];
        if (!dom) {
          $warn("无法找到传入的class对应的DOM元素");
        }
        if (dom instanceof HTMLInputElement && dom.type === "file") {
          this.fileInputElement = dom;
        } else {
          $warn("传入的class对应的DOM元素不是file类型");
        }
      } else {
        $warn("传入的target参数类型错误");
      }
    } else if (target instanceof HTMLInputElement) {
      if (target.type === "file") {
        this.fileInputElement = target;
      } else {
        $warn("传入的DOM元素不是file类型");
      }
    } else {
      $warn("传入的target只能为字符串或者DOM元素");
    }

    this.fileInputElement.addEventListener("change", (e: Event) => {
      [...(e.target as HTMLInputElement).files].forEach((file) => {
        console.log(file);
        let fileUtils = new FileUtils(file, this, this.dispatchEvent, this.configuration.workerPath);
        this.fileMap.set(file, fileUtils);
        if(this.configuration.autoUpload) {
          this.uploadFile(file,this.configuration.ifSendByChunk);
        }
      });
    });
  }

  uploadFile(file: File, ifSendByChunk: boolean = true): void | never {
    if (!this.fileMap.get(file)) {
      return $warn("你输入的文件不存在");
    }
    this.fileMap
      .get(file)
      .uploadTask(
        this.configuration.chunkSize,
        this.configuration.chunkApi,
        this.configuration.fileApi,
        this.dispatchEvent,
        ifSendByChunk
      );
  }

  cancelUploadFile(file: File): void | never {
    if (!this.fileMap.get(file)) {
      return $warn("你输入的文件不存在");
    }
    this.fileMap.get(file).cancelTask();
  }

  //格式化文件的具体大小，基本单位为...B/s,给用户自定义传输速率的格式
  formatSize(size:number): string {
    if(size < 1024) {
      return `${size.toFixed(2)}B`;
    } else if(size >= 1024 && size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)}KB`;
    } else {
      return `${(size / 1024 * 1024).toFixed(2)}MB`;
    }
  }

  showProgress() {
    this.addEventListener("fileSend",(file, total) => {
      this.lastUploadTime = +new Date();
    })

    this.addEventListener("fileProgress", (file, uploadedSize, totalSize)=>{
        let now = +new Date();
        let gap = now - this.lastUploadTime;
        this.gapTime = gap === 0 ? this.gapTime : gap;
        let uploadSpeed = uploadedSize / this.gapTime ;
        let percent = (uploadedSize / totalSize * 100).toFixed(1);
        let expectTime = (totalSize - uploadedSize) / uploadSpeed;
        this.lastUploadTime = now;
        this.dispatchEvent("filePercent", uploadSpeed, percent, expectTime);
    })
  }

  //覆写父类的dispatchEvent方法
  override dispatchEvent: EventFunction = function (type, ...args: any[]) {
    if (this._events[type]) {
      this._events[type].forEach((cb: Function) => cb.call(this, ...args));
    }
  };
}
export default Uploader;
