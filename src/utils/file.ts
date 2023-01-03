import { EventFunction } from "../event/EventTypes";
import Uploader from "../index";
import { AxiosReturnType } from "../type/AxiosType";
import { ChunkItem, Hash } from "../type/ChunkItem";
import Axios from "./axios";
import { ParallelHasher } from "../../node_modules/ts-md5/dist/esm/index";
import $warn from "./warn";
class FileUtils extends Axios {
  private file: File;
  tasks: Array<AxiosReturnType> = [];
  chunks: Array<ChunkItem> = [];//存储文件的切片
  fileId: Hash;
  context: Uploader;
  isFileSend: boolean = false;
  workerPath: string = "";
  dispatchEvent: EventFunction;
  constructor(file: File, context: Uploader, dispatchEvent: EventFunction, workerPath: string) {
    super();
    this.file = file;
    this.context = context;
    this.dispatchEvent = dispatchEvent;
    this.workerPath = workerPath;
    this.chunks.push({
      chunk: this.file,
      id: "",
      percent: 0,
      size: this.file.size
    });
    this.initEvent();
  }

  initEvent() {
    this._events["fileProgress"] = this._events["fileProgress"] || [];
    this._events["fileProgress"].push((dispatchEvent: EventFunction) => {
      let uploadedSize = 0;
      this.chunks.forEach(item=>{
        uploadedSize += item.percent * item.size;
      })
      dispatchEvent.call(
        this.context,
        "fileProgress",
        this.file,
        uploadedSize,
        this.file.size
      );
    });

    this._events["chunkSend"] = this._events["chunkSend"] || [];
    this._events["chunkSend"].push((dispatchEvent: EventFunction) => {
      if (!this.isFileSend) {
        this.isFileSend = true;
        dispatchEvent.call(this.context, "fileSend", this.file);
      }
    });
  }

  // 对file进行切片
  slice(piece: number): void {
    let totalSize = this.file.size;
    let start = 0;
    let chunks = new Array<ChunkItem>();
    while (start < totalSize) {
      let end = start + piece;
      let chunk = this.file.slice(start,end) as File
      chunks.push({
        chunk: chunk,
        id: "",
        percent: 0,
        size: chunk.size
      });
      start = end;
    }
    this.chunks = chunks;
  }

  // ToDo： 使用哈希算法获得文件对应的唯一ID
  getHashId(file:File): Promise<Hash> {
    return new Promise((res,rej)=>{
      let hasher = new ParallelHasher(this.workerPath);
      let hashId: string = "";
      hasher.hash(file).then((id: Hash)=>{
        res(id);
      },(err)=>{
        rej(err);
      })
    })
  }

  generateId() {
    return Promise.all([this.getHashId(this.file), ...this.chunks.map(item=>{
      return this.getHashId(item.chunk)
    })])
  }

  //获取指定的大文件已经传输成功的切片
  getUploadedChunk(context: string): Array<number | string> {
    let record = window.sessionStorage.getItem("$file" + context);
    if (!record) return [];
    else return JSON.parse(record);
  }

  // 保存已经成功上传的切片
  saveUploadedChunk(context: string, chunkId: number | string): void {
    let record = window.sessionStorage.getItem("$file" + context)
      ? JSON.parse(window.sessionStorage.getItem("$file" + context))
      : [];
    record.push(chunkId);
    window.sessionStorage.setItem("$file" + context, JSON.stringify(record));
  }

  addTask(
    chunkApi: string,
    fileApi: string,
    dispatchEvent: EventFunction
  ) {
    this.chunks.forEach((chunkItem, index) => {
      if (!this.getUploadedChunk(this.fileId).includes(chunkItem.id)) {
        let form = new FormData();
        form.append("fileId", this.fileId); //chunk具体属于哪一个文件
        form.append("chunk", chunkItem.chunk);
        form.append("chunkId", chunkItem.id);
        let { p, xhr } = this.sendRequest(
          chunkApi,
          "post",
          form,
          {
            "Content-Type": "multipart/form-data;charset=utf-8",
          },
          chunkItem,
          this.context,
          dispatchEvent
        );
        p.then(
          (response) => {
            //走到这说明该分片传输成功
            this.saveUploadedChunk(this.fileId, chunkItem.id);
            if (response.type === "success") {
              dispatchEvent.call(
                this.context,
                "chunkSuccess",
                this.file,
                chunkItem,
                response.data
              );
              dispatchEvent.call(
                this.context,
                "chunkComplete",
                this.file,
                chunkItem,
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
                chunkItem,
                err.data
              );
              dispatchEvent.call(
                this.context,
                "chunkComplete",
                this.file,
                chunkItem,
                err.data
              );
            } else if (err.type === "error") {
              dispatchEvent.call(
                this.context,
                "chunkError",
                this.file,
                chunkItem,
                err.data
              );
              dispatchEvent.call(
                this.context,
                "chunkComplete",
                this.file,
                chunkItem,
                err.data
              );
            }
          }
        );
        this.tasks.push({ p, xhr, chunkItem });
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

  async uploadTask(
    piece: number,
    chunkApi: string,
    fileApi: string,
    dispatchEvent: EventFunction,
    ifSendByChunk: boolean
  ) {
    if (ifSendByChunk && !sessionStorage.getItem(`file${this.fileId}`)) {
      this.slice(piece);
      let [file,...chunks] = await this.generateId();
      console.log(file,chunks,this,chunks);
      this.fileId = file;
      for(let index in chunks) {
        this.chunks[index].id = chunks[index];
      }
    }
    this.addTask(chunkApi, fileApi, dispatchEvent);
    this.triggerTask(dispatchEvent);
  }

  //文件上传暂停/取消
  cancelTask() {
    this.tasks.forEach((task, index) => {
      if (!this.getUploadedChunk(this.fileId).includes(task.chunkItem.id)) {
        task.xhr.abort();
      }
    });
  }
}

export default FileUtils;
