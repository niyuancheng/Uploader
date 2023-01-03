export type FileEventTypes = "fileSend" | "fileProgress" | "fileAbort" | "fileError" | "fileSuccess" |"fileComplete" | "filePercent";
export type ChunkEventTypes = "chunkSend" | "chunkProgress" | "chunkAbort" | "chunkError" | "chunkSuccess" | "chunkComplete";
export type EventTypes = FileEventTypes | ChunkEventTypes;

export interface EventObject {
    [props:string]: Array<Function>;
}

export type EventFunction = (type:EventTypes,...args: any[]) => void;