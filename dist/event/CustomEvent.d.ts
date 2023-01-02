import { BaseOptions } from "./BaseOptions";
import { EventFunction, EventObject, EventTypes } from "./EventTypes";
export default class CustomEvent {
    _events: EventObject;
    constructor(options: BaseOptions);
    addEventListener(type: EventTypes, listener: Function): this;
    removeEventListener(type: EventTypes, listener: Function): this | never;
    dispatchEvent: EventFunction;
}
