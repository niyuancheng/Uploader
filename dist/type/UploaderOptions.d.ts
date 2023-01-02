export interface UploaderOptions {
    chunkApi: string;
    fileApi: string;
    target?: HTMLInputElement | string;
    ifSendByChunk?: boolean;
    chunkSize?: number;
    autoUpload?: boolean;
}
