import { EventFunction } from "../event/EventTypes";
import Uploader from "../index";
import { AxiosReturnType } from "../type/AxiosType";
import { ChunkItem, Hash } from "../type/ChunkItem";
import Axios from "./axios";
declare class FileUtils extends Axios {
    private file;
    private fileItem;
    tasks: Array<AxiosReturnType>;
    chunks: Array<ChunkItem>;
    fileId: Hash;
    context: Uploader;
    isFileSend: boolean;
    workerPath: string;
    dispatchEvent: EventFunction;
    constructor(file: File, context: Uploader, dispatchEvent: EventFunction, workerPath: string);
    initEvent(): void;
    slice(piece: number): void;
    getHashId(file: File): Promise<Hash>;
    generateId(): Promise<[string, ...string[]]>;
    getUploadedChunk(context: string): Array<number | string>;
    saveUploadedChunk(context: string, chunkId: number | string): void;
    addTask(chunkApi: string, fileApi: string, dispatchEvent: EventFunction): void;
    triggerTask(dispatchEvent: EventFunction): void;
    uploadTask(piece: number, chunkApi: string, fileApi: string, dispatchEvent: EventFunction, ifSendByChunk: boolean): Promise<void>;
    cancelTask(): void;
}
export default FileUtils;
