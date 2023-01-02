import $warn from "../utils/warn";
import { BaseOptions } from "./BaseOptions";
import { EventFunction, EventObject, EventTypes } from "./EventTypes";

export default class CustomEvent {
  _events: EventObject;
  constructor(options: BaseOptions) {
    this._events = {};
    for (let prop in options) {
      this[prop] = options[prop];
    }
  }

  addEventListener(type: EventTypes, listener: Function): this {
    this._events[type] = this._events[type] || [];
    !this._events[type].includes(listener) && this._events[type].push(listener);
    return this;
  }

  removeEventListener(type: EventTypes, listener: Function): this | never {
    if (this._events[type].includes(listener)) {
      let pos = this._events[type].indexOf(listener);
      this._events[type].splice(pos, 1);
    } else {
      $warn("传入的监听者不存在");
    }
    return this;
  }

  //触发事件
  dispatchEvent: EventFunction = function(type,...args:any[]) {
    if (this._events[type]) {
      this._events[type].forEach((cb: Function) => {
        cb.call(this,...args);
      });
    }
    return this;
  }
}
