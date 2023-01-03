export declare type FileEventTypes = "fileSend" | "fileProgress" | "fileAbort" | "fileError" | "fileSuccess" | "fileComplete" | "filePercent";
export declare type ChunkEventTypes = "chunkSend" | "chunkProgress" | "chunkAbort" | "chunkError" | "chunkSuccess" | "chunkComplete";
export declare type EventTypes = FileEventTypes | ChunkEventTypes;
export interface EventObject {
    [props: string]: Array<Function>;
}
export declare type EventFunction = (type: EventTypes, ...args: any[]) => void;
