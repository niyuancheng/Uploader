export declare type AxiosMethod = "post" | "get" | "patch" | "options" | "delete" | "put";
export declare type AxiosRequestData = Document | XMLHttpRequestBodyInit;
export declare type AxiosResponseData = string | number | boolean | {
    [props: string]: AxiosResponseData;
} | AxiosRequestData[];
export declare type AxiosHeaderOptions = {
    "Content-Type"?: string;
    "Content-Length"?: string;
    "Authorization"?: string;
    "Accept-Encoding"?: string;
    "Accept-Language"?: string;
    "Range"?: string;
    "User-Agent"?: string;
    "Host"?: string;
    "Content-Encoding"?: string;
};
export declare type AxiosPromise = {
    data: AxiosResponseData;
    type: "success" | "abort" | "error";
};
export declare type AxiosReturnType = {
    xhr: XMLHttpRequest;
    p: Promise<AxiosPromise>;
};
