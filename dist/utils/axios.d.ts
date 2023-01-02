import { EventFunction, EventObject } from "../event/EventTypes";
import Uploader from "../index";
import { AxiosRequestData, AxiosMethod, AxiosHeaderOptions, AxiosReturnType } from "../type/AxiosType";
declare class Axios {
    loadedSizeArray: number[];
    totalSize: number;
    _events: EventObject;
    constructor();
    sendRequest(url: string, method: AxiosMethod, data: AxiosRequestData, options: AxiosHeaderOptions, index: number, context: Uploader, dispatchEvent?: EventFunction): AxiosReturnType;
}
export default Axios;
