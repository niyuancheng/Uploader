import { UploaderOptions } from "./type/UploaderOptions";
import CustomEvent from "./event/CustomEvent";
import { BaseOptions } from "./event/BaseOptions";
import { EventFunction } from "./event/EventTypes";
import "./utils/console";
declare class Uploader extends CustomEvent {
    private configuration;
    private fileInputElement;
    private fileMap;
    private lastUploadTime;
    constructor(configuration: UploaderOptions, options?: BaseOptions);
    init(): void;
    clearChunkStorage(): void;
    assign(target: string | HTMLInputElement): void | never;
    uploadFile(file: File, ifSendByChunk?: boolean): void | never;
    cancelUploadFile(file: File): void | never;
    formatSize(size: number): string;
    showProgress(): void;
    dispatchEvent: EventFunction;
}
export default Uploader;
