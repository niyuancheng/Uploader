import { EventFunction, EventObject } from "../event/EventTypes";
import Uploader from "../index";
import { AxiosRequestData, AxiosMethod, AxiosHeaderOptions, AxiosReturnType } from "../type/AxiosType";
import { ChunkItem } from "../type/ChunkItem";
declare class Axios {
    loadedSizeArray: number[];
    _events: EventObject;
    constructor();
    sendRequest(url: string, method: AxiosMethod, data: AxiosRequestData, options: AxiosHeaderOptions, chunkItem: ChunkItem, context: Uploader, dispatchEvent?: EventFunction): AxiosReturnType;
}
export default Axios;
