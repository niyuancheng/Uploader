import { EventFunction } from "../event/EventTypes";
import Uploader from "../index";
import { AxiosReturnType } from "../type/AxiosType";
import Axios from "./axios";
class FileUtils extends Axios {
  private file: File;
  tasks: Array<AxiosReturnType> = [];
  chunks: Array<File> = [];
  context: Uploader;
  dispatchEvent: EventFunction;
  constructor(file: File, context: Uploader, dispatchEvent: EventFunction) {
    super();
    this.file = file;
    this.context = context;
    this.dispatchEvent = dispatchEvent;
    this.chunks.push(this.file);
    this._events["fileProgress"] = this._events["fileProgress"] || [];
    this._events["fileProgress"].push((dispatchEvent: EventFunction) => {
      dispatchEvent.call(
        this.context,
        "fileProgress",
        this.file,
        this.loadedSizeArray.reduce((prev, next) => {
          return (prev = prev + next);
        })
      );
    });
  }

  // 对file进行切片
  slice(piece: number): void {
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
  getFileId(): string {
    return this.file.name + this.file.size;
  }

  //获取指定的大文件已经传输成功的切片
  getUploadedChunk(context: string): Array<number> {
    let record = window.sessionStorage.getItem("$file"+context);
    if (!record) return [];
    else return JSON.parse(record);
  }

  // 保存已经成功上传的切片
  saveUploadedChunk(context: string, chunkId: number): void {
    let record = window.sessionStorage.getItem("$file"+context)
      ? JSON.parse(window.sessionStorage.getItem("$file"+context))
      : [];
    record.push(chunkId);

    window.sessionStorage.setItem("$file"+context, JSON.stringify(record));
  }

  addTask(
    chunkApi: string,
    fileApi: string,
    dispatchEvent: EventFunction
  ): void {
    this.chunks.forEach((chunk, index) => {
      if (!this.getUploadedChunk(this.getFileId()).includes(index + 1)) {
        let form = new FormData();
        form.append("context", this.getFileId()); //chunk具体属于哪一个文件
        form.append("chunk", chunk);
        form.append("chunkId", String(index + 1));
        let { p,xhr } = this.sendRequest(
          chunkApi,
          "post",
          form,
          {
            "Content-Type": "multipart/form-data;charset=utf-8",
          },
          index,
          this.context,
          dispatchEvent
        );
        p.then(
          (response) => {
            //走到这说明该分片传输成功
            this.saveUploadedChunk(this.getFileId(), index+1);
            if (response.type === "success") {
              dispatchEvent.call(
                this.context,
                "chunkSuccess",
                this.file,
                chunk,
                index + 1,
                response.data
              );
              dispatchEvent.call(
                this.context,
                "chunkComplete",
                this.file,
                chunk,
                index + 1,
                response.data
              );
            }
          },
          (err) => {
            if (err.type === "abort") {
              dispatchEvent.call(
                this.context,
                "chunkAbort",
                this.file,
                chunk,
                index + 1,
                err.data
              );
              dispatchEvent.call(
                this.context,
                "chunkComplete",
                this.file,
                chunk,
                index + 1,
                err.data
              );
            } else if (err.type === "error") {
              dispatchEvent.call(
                this.context,
                "chunkError",
                this.file,
                chunk,
                index + 1,
                err.data
              );
              dispatchEvent.call(
                this.context,
                "chunkComplete",
                this.file,
                chunk,
                index + 1,
                err.data
              );
            }
          }
        );
        this.tasks.push({ p,xhr });
      }
    });
  }

  triggerTask(dispatchEvent: EventFunction) {
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

  uploadTask(piece:number,chunkApi:string,fileApi:string,dispatchEvent:EventFunction,ifSendByChunk:boolean) {
    if(ifSendByChunk) {
      this.slice(piece);
    }
    this.addTask(chunkApi,fileApi,dispatchEvent);
    this.triggerTask(dispatchEvent);
  }
  //文件上传暂停/取消
  cancelTask() {
    this.tasks.forEach((task,index) => {
        if(!this.getUploadedChunk(this.getFileId()).includes(index + 1)) {
            task.xhr.abort();
        }
    })
  }
}

export default FileUtils;
