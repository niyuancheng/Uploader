import { EventFunction } from "../event/EventTypes";
import Uploader from "../index";
import { AxiosReturnType } from "../type/AxiosType";
import Axios from "./axios";
declare class FileUtils extends Axios {
    private file;
    tasks: Array<AxiosReturnType>;
    chunks: Array<File>;
    context: Uploader;
    dispatchEvent: EventFunction;
    constructor(file: File, context: Uploader, dispatchEvent: EventFunction);
    slice(piece: number): void;
    getFileId(): string;
    getUploadedChunk(context: string): Array<number>;
    saveUploadedChunk(context: string, chunkId: number): void;
    addTask(chunkApi: string, fileApi: string, dispatchEvent: EventFunction): void;
    triggerTask(dispatchEvent: EventFunction): void;
    uploadTask(piece: number, chunkApi: string, fileApi: string, dispatchEvent: EventFunction, ifSendByChunk: boolean): void;
    cancelTask(): void;
}
export default FileUtils;
