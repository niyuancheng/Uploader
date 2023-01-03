export type Hash = string;
export type ChunkItem = {
    chunk: File;
    id: Hash;
    percent: number;
    size: number;
}