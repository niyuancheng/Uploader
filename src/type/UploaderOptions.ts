export interface UploaderOptions {
  chunkApi: string;
  fileApi:string;
  workerPath?:string;
  target?: HTMLInputElement | string;
  ifSendByChunk?: boolean;
  chunkSize?: number;
  autoUpload?:boolean;
}
