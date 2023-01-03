function $warn(message) {
    throw new Error(message);
}

class CustomEvent {
    constructor(options) {
        //触发事件
        this.dispatchEvent = function (type, ...args) {
            if (this._events[type]) {
                this._events[type].forEach((cb) => {
                    cb.call(this, ...args);
                });
            }
            return this;
        };
        this._events = {};
        for (let prop in options) {
            this[prop] = options[prop];
        }
    }
    addEventListener(type, listener) {
        this._events[type] = this._events[type] || [];
        !this._events[type].includes(listener) && this._events[type].push(listener);
        return this;
    }
    removeEventListener(type, listener) {
        if (this._events[type].includes(listener)) {
            let pos = this._events[type].indexOf(listener);
            this._events[type].splice(pos, 1);
        }
        else {
            $warn("传入的监听者不存在");
        }
        return this;
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class Axios {
    constructor() {
        this.loadedSizeArray = [];
        this._events = {};
    }
    sendRequest(url, method, data, options = {}, chunkItem, context, dispatchEvent) {
        let xhr = new XMLHttpRequest();
        let p = new Promise((res, rej) => {
            //刚发送http请求时触发loadstart事件
            xhr.upload.onloadstart = (e) => {
                dispatchEvent.call(context, "chunkSend", chunkItem);
                this._events["chunkSend"] &&
                    this._events["chunkSend"].forEach((cb) => cb.call(this, dispatchEvent));
            };
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    dispatchEvent.call(context, "chunkProgress", chunkItem, e.loaded, e.total);
                    chunkItem.percent = parseFloat((e.loaded / e.total).toFixed(2));
                    this._events["fileProgress"] &&
                        this._events["fileProgress"].forEach((cb) => cb.call(this, dispatchEvent));
                }
            };
            //http请求发送结束后触发load事件，--> loadend | abort | end
            xhr.onload = (e) => {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    res({ data: JSON.parse(xhr.responseText), type: "success" });
                }
            };
            xhr.onerror = (e) => {
                rej({ data: xhr.responseText, type: "error" });
            };
            xhr.onabort = (e) => {
                rej({ data: xhr.responseText, type: "abort" });
            };
            xhr.open(method, url);
            for (let key in options) {
                xhr.setRequestHeader(key, options[key]);
            }
            //设置HTTP请求的头部
            xhr.send(data);
        });
        return {
            p: p,
            xhr: xhr,
        };
    }
}

/*

TypeScript Md5
==============

Based on work by
* Joseph Myers: http://www.myersdaily.org/joseph/javascript/md5-text.html
* André Cruz: https://github.com/satazor/SparkMD5
* Raymond Hill: https://github.com/gorhill/yamd5.js

Effectively a TypeScrypt re-write of Raymond Hill JS Library

The MIT License (MIT)

Copyright (C) 2014 Raymond Hill

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.



            DO WHAT YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) 2015 André Cruz <amdfcruz@gmail.com>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT YOU WANT TO.


*/
class Md5 {
  constructor() {
    this._dataLength = 0;
    this._bufferLength = 0;
    this._state = new Int32Array(4);
    this._buffer = new ArrayBuffer(68);
    this._buffer8 = new Uint8Array(this._buffer, 0, 68);
    this._buffer32 = new Uint32Array(this._buffer, 0, 17);
    this.start();
  }
  static hashStr(str, raw = false) {
    return this.onePassHasher.start().appendStr(str).end(raw);
  }
  static hashAsciiStr(str, raw = false) {
    return this.onePassHasher.start().appendAsciiStr(str).end(raw);
  }
  static _hex(x) {
    const hc = Md5.hexChars;
    const ho = Md5.hexOut;
    let n;
    let offset;
    let j;
    let i;
    for (i = 0; i < 4; i += 1) {
      offset = i * 8;
      n = x[i];
      for (j = 0; j < 8; j += 2) {
        ho[offset + 1 + j] = hc.charAt(n & 0x0F);
        n >>>= 4;
        ho[offset + 0 + j] = hc.charAt(n & 0x0F);
        n >>>= 4;
      }
    }
    return ho.join('');
  }
  static _md5cycle(x, k) {
    let a = x[0];
    let b = x[1];
    let c = x[2];
    let d = x[3];
    // ff()
    a += (b & c | ~b & d) + k[0] - 680876936 | 0;
    a = (a << 7 | a >>> 25) + b | 0;
    d += (a & b | ~a & c) + k[1] - 389564586 | 0;
    d = (d << 12 | d >>> 20) + a | 0;
    c += (d & a | ~d & b) + k[2] + 606105819 | 0;
    c = (c << 17 | c >>> 15) + d | 0;
    b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
    b = (b << 22 | b >>> 10) + c | 0;
    a += (b & c | ~b & d) + k[4] - 176418897 | 0;
    a = (a << 7 | a >>> 25) + b | 0;
    d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
    d = (d << 12 | d >>> 20) + a | 0;
    c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
    c = (c << 17 | c >>> 15) + d | 0;
    b += (c & d | ~c & a) + k[7] - 45705983 | 0;
    b = (b << 22 | b >>> 10) + c | 0;
    a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
    a = (a << 7 | a >>> 25) + b | 0;
    d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
    d = (d << 12 | d >>> 20) + a | 0;
    c += (d & a | ~d & b) + k[10] - 42063 | 0;
    c = (c << 17 | c >>> 15) + d | 0;
    b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
    b = (b << 22 | b >>> 10) + c | 0;
    a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
    a = (a << 7 | a >>> 25) + b | 0;
    d += (a & b | ~a & c) + k[13] - 40341101 | 0;
    d = (d << 12 | d >>> 20) + a | 0;
    c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
    c = (c << 17 | c >>> 15) + d | 0;
    b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
    b = (b << 22 | b >>> 10) + c | 0;
    // gg()
    a += (b & d | c & ~d) + k[1] - 165796510 | 0;
    a = (a << 5 | a >>> 27) + b | 0;
    d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
    d = (d << 9 | d >>> 23) + a | 0;
    c += (d & b | a & ~b) + k[11] + 643717713 | 0;
    c = (c << 14 | c >>> 18) + d | 0;
    b += (c & a | d & ~a) + k[0] - 373897302 | 0;
    b = (b << 20 | b >>> 12) + c | 0;
    a += (b & d | c & ~d) + k[5] - 701558691 | 0;
    a = (a << 5 | a >>> 27) + b | 0;
    d += (a & c | b & ~c) + k[10] + 38016083 | 0;
    d = (d << 9 | d >>> 23) + a | 0;
    c += (d & b | a & ~b) + k[15] - 660478335 | 0;
    c = (c << 14 | c >>> 18) + d | 0;
    b += (c & a | d & ~a) + k[4] - 405537848 | 0;
    b = (b << 20 | b >>> 12) + c | 0;
    a += (b & d | c & ~d) + k[9] + 568446438 | 0;
    a = (a << 5 | a >>> 27) + b | 0;
    d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
    d = (d << 9 | d >>> 23) + a | 0;
    c += (d & b | a & ~b) + k[3] - 187363961 | 0;
    c = (c << 14 | c >>> 18) + d | 0;
    b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
    b = (b << 20 | b >>> 12) + c | 0;
    a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
    a = (a << 5 | a >>> 27) + b | 0;
    d += (a & c | b & ~c) + k[2] - 51403784 | 0;
    d = (d << 9 | d >>> 23) + a | 0;
    c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
    c = (c << 14 | c >>> 18) + d | 0;
    b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
    b = (b << 20 | b >>> 12) + c | 0;
    // hh()
    a += (b ^ c ^ d) + k[5] - 378558 | 0;
    a = (a << 4 | a >>> 28) + b | 0;
    d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
    d = (d << 11 | d >>> 21) + a | 0;
    c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
    c = (c << 16 | c >>> 16) + d | 0;
    b += (c ^ d ^ a) + k[14] - 35309556 | 0;
    b = (b << 23 | b >>> 9) + c | 0;
    a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
    a = (a << 4 | a >>> 28) + b | 0;
    d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
    d = (d << 11 | d >>> 21) + a | 0;
    c += (d ^ a ^ b) + k[7] - 155497632 | 0;
    c = (c << 16 | c >>> 16) + d | 0;
    b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
    b = (b << 23 | b >>> 9) + c | 0;
    a += (b ^ c ^ d) + k[13] + 681279174 | 0;
    a = (a << 4 | a >>> 28) + b | 0;
    d += (a ^ b ^ c) + k[0] - 358537222 | 0;
    d = (d << 11 | d >>> 21) + a | 0;
    c += (d ^ a ^ b) + k[3] - 722521979 | 0;
    c = (c << 16 | c >>> 16) + d | 0;
    b += (c ^ d ^ a) + k[6] + 76029189 | 0;
    b = (b << 23 | b >>> 9) + c | 0;
    a += (b ^ c ^ d) + k[9] - 640364487 | 0;
    a = (a << 4 | a >>> 28) + b | 0;
    d += (a ^ b ^ c) + k[12] - 421815835 | 0;
    d = (d << 11 | d >>> 21) + a | 0;
    c += (d ^ a ^ b) + k[15] + 530742520 | 0;
    c = (c << 16 | c >>> 16) + d | 0;
    b += (c ^ d ^ a) + k[2] - 995338651 | 0;
    b = (b << 23 | b >>> 9) + c | 0;
    // ii()
    a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
    a = (a << 6 | a >>> 26) + b | 0;
    d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
    d = (d << 10 | d >>> 22) + a | 0;
    c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
    c = (c << 15 | c >>> 17) + d | 0;
    b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
    b = (b << 21 | b >>> 11) + c | 0;
    a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
    a = (a << 6 | a >>> 26) + b | 0;
    d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
    d = (d << 10 | d >>> 22) + a | 0;
    c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
    c = (c << 15 | c >>> 17) + d | 0;
    b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
    b = (b << 21 | b >>> 11) + c | 0;
    a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
    a = (a << 6 | a >>> 26) + b | 0;
    d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
    d = (d << 10 | d >>> 22) + a | 0;
    c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
    c = (c << 15 | c >>> 17) + d | 0;
    b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
    b = (b << 21 | b >>> 11) + c | 0;
    a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
    a = (a << 6 | a >>> 26) + b | 0;
    d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
    d = (d << 10 | d >>> 22) + a | 0;
    c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
    c = (c << 15 | c >>> 17) + d | 0;
    b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
    b = (b << 21 | b >>> 11) + c | 0;
    x[0] = a + x[0] | 0;
    x[1] = b + x[1] | 0;
    x[2] = c + x[2] | 0;
    x[3] = d + x[3] | 0;
  }
  /**
   * Initialise buffer to be hashed
   */
  start() {
    this._dataLength = 0;
    this._bufferLength = 0;
    this._state.set(Md5.stateIdentity);
    return this;
  }
  // Char to code point to to array conversion:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  // #Example.3A_Fixing_charCodeAt_to_handle_non-Basic-Multilingual-Plane_characters_if_their_presence_earlier_in_the_string_is_unknown
  /**
   * Append a UTF-8 string to the hash buffer
   * @param str String to append
   */
  appendStr(str) {
    const buf8 = this._buffer8;
    const buf32 = this._buffer32;
    let bufLen = this._bufferLength;
    let code;
    let i;
    for (i = 0; i < str.length; i += 1) {
      code = str.charCodeAt(i);
      if (code < 128) {
        buf8[bufLen++] = code;
      } else if (code < 0x800) {
        buf8[bufLen++] = (code >>> 6) + 0xC0;
        buf8[bufLen++] = code & 0x3F | 0x80;
      } else if (code < 0xD800 || code > 0xDBFF) {
        buf8[bufLen++] = (code >>> 12) + 0xE0;
        buf8[bufLen++] = code >>> 6 & 0x3F | 0x80;
        buf8[bufLen++] = code & 0x3F | 0x80;
      } else {
        code = (code - 0xD800) * 0x400 + (str.charCodeAt(++i) - 0xDC00) + 0x10000;
        if (code > 0x10FFFF) {
          throw new Error('Unicode standard supports code points up to U+10FFFF');
        }
        buf8[bufLen++] = (code >>> 18) + 0xF0;
        buf8[bufLen++] = code >>> 12 & 0x3F | 0x80;
        buf8[bufLen++] = code >>> 6 & 0x3F | 0x80;
        buf8[bufLen++] = code & 0x3F | 0x80;
      }
      if (bufLen >= 64) {
        this._dataLength += 64;
        Md5._md5cycle(this._state, buf32);
        bufLen -= 64;
        buf32[0] = buf32[16];
      }
    }
    this._bufferLength = bufLen;
    return this;
  }
  /**
   * Append an ASCII string to the hash buffer
   * @param str String to append
   */
  appendAsciiStr(str) {
    const buf8 = this._buffer8;
    const buf32 = this._buffer32;
    let bufLen = this._bufferLength;
    let i;
    let j = 0;
    for (;;) {
      i = Math.min(str.length - j, 64 - bufLen);
      while (i--) {
        buf8[bufLen++] = str.charCodeAt(j++);
      }
      if (bufLen < 64) {
        break;
      }
      this._dataLength += 64;
      Md5._md5cycle(this._state, buf32);
      bufLen = 0;
    }
    this._bufferLength = bufLen;
    return this;
  }
  /**
   * Append a byte array to the hash buffer
   * @param input array to append
   */
  appendByteArray(input) {
    const buf8 = this._buffer8;
    const buf32 = this._buffer32;
    let bufLen = this._bufferLength;
    let i;
    let j = 0;
    for (;;) {
      i = Math.min(input.length - j, 64 - bufLen);
      while (i--) {
        buf8[bufLen++] = input[j++];
      }
      if (bufLen < 64) {
        break;
      }
      this._dataLength += 64;
      Md5._md5cycle(this._state, buf32);
      bufLen = 0;
    }
    this._bufferLength = bufLen;
    return this;
  }
  /**
   * Get the state of the hash buffer
   */
  getState() {
    const s = this._state;
    return {
      buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)),
      buflen: this._bufferLength,
      length: this._dataLength,
      state: [s[0], s[1], s[2], s[3]]
    };
  }
  /**
   * Override the current state of the hash buffer
   * @param state New hash buffer state
   */
  setState(state) {
    const buf = state.buffer;
    const x = state.state;
    const s = this._state;
    let i;
    this._dataLength = state.length;
    this._bufferLength = state.buflen;
    s[0] = x[0];
    s[1] = x[1];
    s[2] = x[2];
    s[3] = x[3];
    for (i = 0; i < buf.length; i += 1) {
      this._buffer8[i] = buf.charCodeAt(i);
    }
  }
  /**
   * Hash the current state of the hash buffer and return the result
   * @param raw Whether to return the value as an `Int32Array`
   */
  end(raw = false) {
    const bufLen = this._bufferLength;
    const buf8 = this._buffer8;
    const buf32 = this._buffer32;
    const i = (bufLen >> 2) + 1;
    this._dataLength += bufLen;
    const dataBitsLen = this._dataLength * 8;
    buf8[bufLen] = 0x80;
    buf8[bufLen + 1] = buf8[bufLen + 2] = buf8[bufLen + 3] = 0;
    buf32.set(Md5.buffer32Identity.subarray(i), i);
    if (bufLen > 55) {
      Md5._md5cycle(this._state, buf32);
      buf32.set(Md5.buffer32Identity);
    }
    // Do the final computation based on the tail and length
    // Beware that the final length may not fit in 32 bits so we take care of that
    if (dataBitsLen <= 0xFFFFFFFF) {
      buf32[14] = dataBitsLen;
    } else {
      const matches = dataBitsLen.toString(16).match(/(.*?)(.{0,8})$/);
      if (matches === null) {
        return;
      }
      const lo = parseInt(matches[2], 16);
      const hi = parseInt(matches[1], 16) || 0;
      buf32[14] = lo;
      buf32[15] = hi;
    }
    Md5._md5cycle(this._state, buf32);
    return raw ? this._state : Md5._hex(this._state);
  }
}
// Private Static Variables
Md5.stateIdentity = new Int32Array([1732584193, -271733879, -1732584194, 271733878]);
Md5.buffer32Identity = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
Md5.hexChars = '0123456789abcdef';
Md5.hexOut = [];
// Permanent instance is to use for one-call hashing
Md5.onePassHasher = new Md5();
if (Md5.hashStr('hello') !== '5d41402abc4b2a76b9719d911017c592') {
  throw new Error('Md5 self test failed.');
}

class ParallelHasher {
  constructor(workerUri, workerOptions) {
    this._queue = [];
    this._ready = true;
    const self = this;
    if (Worker) {
      self._hashWorker = new Worker(workerUri, workerOptions);
      self._hashWorker.onmessage = self._recievedMessage.bind(self);
      self._hashWorker.onerror = err => {
        self._ready = false;
        console.error('Hash worker failure', err);
      };
    } else {
      self._ready = false;
      console.error('Web Workers are not supported in this browser');
    }
  }
  /**
   * Hash a blob of data in the worker
   * @param blob Data to hash
   * @returns Promise of the Hashed result
   */
  hash(blob) {
    const self = this;
    let promise;
    promise = new Promise((resolve, reject) => {
      self._queue.push({
        blob,
        resolve,
        reject
      });
      self._processNext();
    });
    return promise;
  }
  /** Terminate any existing hash requests */
  terminate() {
    this._ready = false;
    this._hashWorker.terminate();
  }
  // Processes the next item in the queue
  _processNext() {
    if (this._ready && !this._processing && this._queue.length > 0) {
      this._processing = this._queue.pop();
      this._hashWorker.postMessage(this._processing.blob);
    }
  }
  // Hash result is returned from the worker
  _recievedMessage(evt) {
    var _a, _b;
    const data = evt.data;
    if (data.success) {
      (_a = this._processing) === null || _a === void 0 ? void 0 : _a.resolve(data.result);
    } else {
      (_b = this._processing) === null || _b === void 0 ? void 0 : _b.reject(data.result);
    }
    this._processing = undefined;
    this._processNext();
  }
}

class FileUtils extends Axios {
    constructor(file, context, dispatchEvent, workerPath) {
        super();
        this.tasks = [];
        this.chunks = []; //存储文件的切片
        this.isFileSend = false;
        this.workerPath = "";
        this.file = file;
        this.context = context;
        this.dispatchEvent = dispatchEvent;
        this.workerPath = workerPath;
        this.chunks.push({
            chunk: this.file,
            id: "",
            percent: 0,
            size: this.file.size
        });
        this.initEvent();
    }
    initEvent() {
        this._events["fileProgress"] = this._events["fileProgress"] || [];
        this._events["fileProgress"].push((dispatchEvent) => {
            let uploadedSize = 0;
            this.chunks.forEach(item => {
                uploadedSize += item.percent * item.size;
            });
            dispatchEvent.call(this.context, "fileProgress", this.file, uploadedSize, this.file.size);
        });
        this._events["chunkSend"] = this._events["chunkSend"] || [];
        this._events["chunkSend"].push((dispatchEvent) => {
            if (!this.isFileSend) {
                this.isFileSend = true;
                dispatchEvent.call(this.context, "fileSend", this.file);
            }
        });
    }
    // 对file进行切片
    slice(piece) {
        let totalSize = this.file.size;
        let start = 0;
        let chunks = new Array();
        while (start < totalSize) {
            let end = start + piece;
            let chunk = this.file.slice(start, end);
            chunks.push({
                chunk: chunk,
                id: "",
                percent: 0,
                size: chunk.size
            });
            start = end;
        }
        this.chunks = chunks;
    }
    // ToDo： 使用哈希算法获得文件对应的唯一ID
    getHashId(file) {
        return new Promise((res, rej) => {
            let hasher = new ParallelHasher(this.workerPath);
            hasher.hash(file).then((id) => {
                res(id);
            }, (err) => {
                rej(err);
            });
        });
    }
    generateId() {
        return Promise.all([this.getHashId(this.file), ...this.chunks.map(item => {
                return this.getHashId(item.chunk);
            })]);
    }
    //获取指定的大文件已经传输成功的切片
    getUploadedChunk(context) {
        let record = window.sessionStorage.getItem("$file" + context);
        if (!record)
            return [];
        else
            return JSON.parse(record);
    }
    // 保存已经成功上传的切片
    saveUploadedChunk(context, chunkId) {
        let record = window.sessionStorage.getItem("$file" + context)
            ? JSON.parse(window.sessionStorage.getItem("$file" + context))
            : [];
        record.push(chunkId);
        window.sessionStorage.setItem("$file" + context, JSON.stringify(record));
    }
    addTask(chunkApi, fileApi, dispatchEvent) {
        this.chunks.forEach((chunkItem, index) => {
            if (!this.getUploadedChunk(this.fileId).includes(chunkItem.id)) {
                let form = new FormData();
                form.append("fileId", this.fileId); //chunk具体属于哪一个文件
                form.append("chunk", chunkItem.chunk);
                form.append("chunkId", chunkItem.id);
                let { p, xhr } = this.sendRequest(chunkApi, "post", form, {
                    "Content-Type": "multipart/form-data;charset=utf-8",
                }, chunkItem, this.context, dispatchEvent);
                p.then((response) => {
                    //走到这说明该分片传输成功
                    this.saveUploadedChunk(this.fileId, chunkItem.id);
                    if (response.type === "success") {
                        dispatchEvent.call(this.context, "chunkSuccess", this.file, chunkItem, response.data);
                        dispatchEvent.call(this.context, "chunkComplete", this.file, chunkItem, response.data);
                    }
                }, (err) => {
                    if (err.type === "abort") {
                        dispatchEvent.call(this.context, "chunkAbort", this.file, chunkItem, err.data);
                        dispatchEvent.call(this.context, "chunkComplete", this.file, chunkItem, err.data);
                    }
                    else if (err.type === "error") {
                        dispatchEvent.call(this.context, "chunkError", this.file, chunkItem, err.data);
                        dispatchEvent.call(this.context, "chunkComplete", this.file, chunkItem, err.data);
                    }
                });
                this.tasks.push({ p, xhr, chunkItem });
            }
        });
    }
    triggerTask(dispatchEvent) {
        Promise.allSettled(this.tasks).then((resArry) => {
            for (let res of resArry) {
                if (res.status === "rejected") {
                    return dispatchEvent.call(this.context, "fileComplete", this.file);
                }
            }
            dispatchEvent.call(this.context, "fileComplete", this.file);
            dispatchEvent.call(this.context, "fileSuccess", this.file);
        });
    }
    uploadTask(piece, chunkApi, fileApi, dispatchEvent, ifSendByChunk) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ifSendByChunk && !sessionStorage.getItem(`file${this.fileId}`)) {
                this.slice(piece);
                let [file, ...chunks] = yield this.generateId();
                this.fileId = file;
                for (let index in chunks) {
                    this.chunks[index].id = chunks[index];
                }
            }
            this.addTask(chunkApi, fileApi, dispatchEvent);
            this.triggerTask(dispatchEvent);
        });
    }
    //文件上传暂停/取消
    cancelTask() {
        this.tasks.forEach((task, index) => {
            if (!this.getUploadedChunk(this.fileId).includes(task.chunkItem.id)) {
                task.xhr.abort();
            }
        });
    }
}

let message = "欢迎使用大文件传输库UploadeJS，UploaderJS是一款效率极高的文件上传库，具有多种完善配置，关注作者Nova获取更多最新咨询吧";
let a = 'background: #606060; color: #fff; border-radius: 3px 0 0 3px;';
let b = 'background: #1475B2; color: #fff; border-radius: 0 3px 3px 0;';
console.log(`%c UploaderJS: %c ${message}`, a, b);

const idRegx = /\s*#.+/g;
const classNameRegx = /\s*\..+/g;
class Uploader extends CustomEvent {
    constructor(configuration, options = {}) {
        super(options);
        this.configuration = {
            ifSendByChunk: true,
            chunkSize: 1024 * 1024 * 0.1,
            autoUpload: true,
            workerPath: "../hash_worker.js",
            chunkApi: "",
            fileApi: ""
        };
        this.fileMap = new Map();
        this.lastUploadTime = 0;
        this.gapTime = 0;
        //覆写父类的dispatchEvent方法
        this.dispatchEvent = function (type, ...args) {
            if (this._events[type]) {
                this._events[type].forEach((cb) => cb.call(this, ...args));
            }
        };
        this.configuration = Object.assign(this.configuration, configuration);
        this.init();
    }
    init() {
        let target = this.configuration.target || undefined;
        if (target) {
            this.assign(target);
        }
        this.clearChunkStorage();
        this.showProgress();
    }
    clearChunkStorage() {
        for (let key in window.sessionStorage) {
            if (/^\$file.*/.test(key)) {
                window.sessionStorage.removeItem(key);
            }
        }
    }
    // 在调用该方法之后，类Uploader会托管传入的DOM元素
    assign(target) {
        if (typeof target === "string") {
            //如果用户传入的target是字符串的话，分为两种可能，一是传入id,或者传入className，需要分情况讨论。
            if (idRegx.test(target)) {
                let dom = document.querySelector(target);
                if (!dom) {
                    $warn("无法找到传入的id对应的DOM元素");
                }
                if (dom instanceof HTMLInputElement && dom.type === "file") {
                    this.fileInputElement = dom;
                }
                else {
                    $warn("传入的id对应的DOM元素不是file类型");
                }
            }
            else if (classNameRegx.test(target)) {
                let dom = document.querySelectorAll(target)[0];
                if (!dom) {
                    $warn("无法找到传入的class对应的DOM元素");
                }
                if (dom instanceof HTMLInputElement && dom.type === "file") {
                    this.fileInputElement = dom;
                }
                else {
                    $warn("传入的class对应的DOM元素不是file类型");
                }
            }
            else {
                $warn("传入的target参数类型错误");
            }
        }
        else if (target instanceof HTMLInputElement) {
            if (target.type === "file") {
                this.fileInputElement = target;
            }
            else {
                $warn("传入的DOM元素不是file类型");
            }
        }
        else {
            $warn("传入的target只能为字符串或者DOM元素");
        }
        this.fileInputElement.addEventListener("change", (e) => {
            [...e.target.files].forEach((file) => {
                console.log(file);
                let fileUtils = new FileUtils(file, this, this.dispatchEvent, this.configuration.workerPath);
                this.fileMap.set(file, fileUtils);
                if (this.configuration.autoUpload) {
                    this.uploadFile(file, this.configuration.ifSendByChunk);
                }
            });
        });
    }
    uploadFile(file, ifSendByChunk = true) {
        if (!this.fileMap.get(file)) {
            return $warn("你输入的文件不存在");
        }
        this.fileMap
            .get(file)
            .uploadTask(this.configuration.chunkSize, this.configuration.chunkApi, this.configuration.fileApi, this.dispatchEvent, ifSendByChunk);
    }
    cancelUploadFile(file) {
        if (!this.fileMap.get(file)) {
            return $warn("你输入的文件不存在");
        }
        this.fileMap.get(file).cancelTask();
    }
    //格式化文件的具体大小，基本单位为...B/s,给用户自定义传输速率的格式
    formatSize(size) {
        if (size < 1024) {
            return `${size.toFixed(2)}B`;
        }
        else if (size >= 1024 && size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)}KB`;
        }
        else {
            return `${(size / 1024 * 1024).toFixed(2)}MB`;
        }
    }
    showProgress() {
        this.addEventListener("fileSend", (file, total) => {
            this.lastUploadTime = +new Date();
        });
        this.addEventListener("fileProgress", (file, uploadedSize, totalSize) => {
            let now = +new Date();
            let gap = now - this.lastUploadTime;
            this.gapTime = gap === 0 ? this.gapTime : gap;
            let uploadSpeed = uploadedSize / this.gapTime;
            let percent = (uploadedSize / totalSize * 100).toFixed(1);
            let expectTime = (totalSize - uploadedSize) / uploadSpeed;
            this.lastUploadTime = now;
            this.dispatchEvent("filePercent", uploadSpeed, percent, expectTime);
        });
    }
}

export { Uploader as default };
