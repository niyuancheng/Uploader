import { Hash } from "./ChunkItem";

export type FileItem = {
    file: File;
    id: Hash;
    size: number;
}