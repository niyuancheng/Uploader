export default function $warn(message:string): never {
    throw new Error(message);
}