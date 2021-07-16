"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flush = exports.soft = exports.proxy = exports.wrap = exports.softAssert = exports.SoftAssert = void 0;
const assert_1 = require("assert");
function formatAssertionError(err) {
    let msg;
    let message;
    if (err.message && typeof err.message.toString === 'function') {
        message = err.message + '';
    }
    else if (typeof err.inspect === 'function') {
        message = err.inspect() + '';
    }
    else {
        message = '';
    }
    let stack = err.stack || message;
    let index = message ? stack.indexOf(message) : -1;
    if (index === -1) {
        msg = message;
    }
    else {
        index += message.length;
        msg = stack.slice(0, index);
        stack = stack.slice(index + 1);
    }
    if (err.uncaught) {
        msg = 'Uncaught ' + msg;
    }
    stack = stack.replace(/^/gm, '  ');
    return `${msg}\n${stack}\n`;
}
class SoftAssert {
    constructor() {
        this.captured = [];
    }
    capture(e) {
        var _a, _b;
        if (((_b = (_a = e.constructor) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.indexOf("AssertionError")) >= 0) {
            this.captured.push(e);
        }
        else {
            throw e;
        }
    }
    proxy(target) {
        if (!target) {
            return target;
        }
        switch (typeof (target)) {
            case "function":
                return this.proxyObj(this.proxyFn(target), target);
            case "object":
                return this.proxyObj(target);
            default:
                return target;
        }
    }
    proxyObj(target, original = target) {
        const self = this;
        if (!target) {
            return target;
        }
        return new Proxy(target, {
            get: function (_oTarget, sKey) {
                var _a, _b;
                let value;
                try {
                    value = original[sKey];
                }
                catch (e) {
                    self.capture(e);
                    return undefined;
                }
                if ((_a = value) === null || _a === void 0 ? void 0 : _a.catch) {
                    value = (_b = value) === null || _b === void 0 ? void 0 : _b.catch(e => self.capture(e));
                }
                return self.proxy(value);
            },
        });
    }
    proxyFn(target) {
        const self = this;
        const wrapperFn = function () {
            var _a, _b;
            try {
                const value = self.proxy(target.apply(this, arguments));
                if ((_a = value) === null || _a === void 0 ? void 0 : _a.catch) {
                    return (_b = value) === null || _b === void 0 ? void 0 : _b.catch(e => this.capture(e));
                }
                return value;
            }
            catch (e) {
                self.capture(e);
            }
        };
        const binding = { [target.name]: wrapperFn }[target.name];
        binding.prototype = target.prototype;
        return binding;
    }
    wrap(target) {
        const isAsync = target.constructor.name === "AsyncFunction";
        const params = target.length;
        const self = this;
        const wrapperFn = isAsync ?
            function () {
                return __awaiter(this, arguments, void 0, function* () {
                    try {
                        return yield target.apply(this, arguments);
                    }
                    catch (e) {
                        self.capture(e);
                    }
                });
            } :
            function () {
                try {
                    return target.apply(this, arguments);
                }
                catch (e) {
                    self.capture(e);
                }
            };
        const binding = { [target.name]: wrapperFn }[target.name];
        Object.defineProperty(binding, "length", {
            value: params
        });
        return binding;
    }
    soft(target) {
        this.wrap(target)();
    }
    flush() {
        if (this.captured.length > 1) {
            let message = `Total failures are: ${this.captured.length}\n\n${this.captured.map(formatAssertionError).join("\n\n")}`;
            this.captured = [];
            throw new assert_1.AssertionError({ message });
        }
        else if (this.captured.length === 1) {
            const message = this.captured[0];
            this.captured = [];
            throw message;
        }
    }
}
exports.SoftAssert = SoftAssert;
exports.softAssert = new SoftAssert();
exports.wrap = exports.softAssert.wrap.bind(exports.softAssert);
exports.proxy = exports.softAssert.proxy.bind(exports.softAssert);
exports.soft = exports.softAssert.soft.bind(exports.softAssert);
exports.flush = exports.softAssert.flush.bind(exports.softAssert);
//# sourceMappingURL=soft-assert.js.map