import { EventFunction, EventObject } from "../event/EventTypes";
import Uploader from "../index";
import {
  AxiosRequestData,
  AxiosMethod,
  AxiosHeaderOptions,
  AxiosPromise,
  AxiosReturnType,
} from "../type/AxiosType";
import { ChunkItem } from "../type/ChunkItem";
import { FileItem } from "../type/FileItem";

class Axios {
  loadedSizeArray: number[] = [];
  _events: EventObject;
  constructor() {
    this._events = {};
  }

  sendRequest(
    url: string,
    method: AxiosMethod,
    data: AxiosRequestData,
    options: AxiosHeaderOptions = {},
    fileItem: FileItem,
    chunkItem: ChunkItem,
    context: Uploader,
    dispatchEvent?: EventFunction
  ): AxiosReturnType {
    let xhr = new XMLHttpRequest();
    let p = new Promise((res, rej) => {
      //刚发送http请求时触发loadstart事件
      xhr.upload.onloadstart = (e) => {
        dispatchEvent.call(context, "chunkSend", chunkItem);
        this._events["chunkSend"] &&
          this._events["chunkSend"].forEach((cb) =>
            cb.call(this, dispatchEvent)
          );
      };

      xhr.upload.onprogress = (e) => {
        chunkItem.percent = parseFloat((e.loaded / e.total).toFixed(2));
        if (e.lengthComputable) {
          dispatchEvent.call(
            context,
            "chunkProgress",
            fileItem,
            chunkItem,
          );
          this._events["fileProgress"] &&
            this._events["fileProgress"].forEach((cb) =>
              cb.call(this, dispatchEvent)
            );
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
      xhr.send(data as XMLHttpRequestBodyInit);
    });

    return {
      p: p as Promise<AxiosPromise>,
      xhr: xhr,
    };
  }
}

export default Axios;
