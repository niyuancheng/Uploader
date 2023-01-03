import { ChunkItem } from "./ChunkItem";

export type AxiosMethod =
  | "post"
  | "get"
  | "patch"
  | "options"
  | "delete"
  | "put";
export type AxiosRequestData = Document | XMLHttpRequestBodyInit;
export type AxiosResponseData = string | number | boolean | {
  [props:string]: AxiosResponseData;
} | AxiosRequestData[]

export type AxiosHeaderOptions = {
  "Content-Type"?: string;
  "Content-Length"?: string;
  "Authorization"?: string;
  "Accept-Encoding"?:string;
  "Accept-Language"?:string;
  "Range"?:string;
  "User-Agent"?:string;
  "Host"?:string;
  "Content-Encoding"?:string;
}

export type AxiosPromise = {
  data: AxiosResponseData;
  type: "success" | "abort" | "error"
}

export type AxiosReturnType = {
  xhr: XMLHttpRequest;
  p: Promise<AxiosPromise>;
  chunkItem?: ChunkItem
}