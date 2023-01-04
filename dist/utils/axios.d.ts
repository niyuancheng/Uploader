import { EventFunction, EventObject } from "../event/EventTypes";
import Uploader from "../index";
import { AxiosRequestData, AxiosMethod, AxiosHeaderOptions, AxiosReturnType } from "../type/AxiosType";
import { ChunkItem } from "../type/ChunkItem";
import { FileItem } from "../type/FileItem";
declare class Axios {
    _events: EventObject;
    constructor();
    sendRequest(url: string, method: AxiosMethod, data: AxiosRequestData, options: AxiosHeaderOptions, fileItem: FileItem, chunkItem: ChunkItem, context: Uploader, dispatchEvent?: EventFunction): AxiosReturnType;
}
export default Axios;
