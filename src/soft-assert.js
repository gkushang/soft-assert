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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.flush = exports.soft = exports.proxy = exports.wrap = exports.softAssert = exports.SoftAssert = void 0;
var assert_1 = require("assert");
function formatAssertionError(err) {
    var msg;
    var message;
    if (err.message && typeof err.message.toString === 'function') {
        message = err.message + '';
    }
    else if (typeof err.inspect === 'function') {
        message = err.inspect() + '';
    }
    else {
        message = '';
    }
    var stack = err.stack || message;
    var index = message ? stack.indexOf(message) : -1;
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
    return msg + "\n" + stack + "\n";
}
var SoftAssert = /** @class */ (function () {
    function SoftAssert() {
        this.captured = [];
    }
    SoftAssert.prototype.capture = function (e) {
        var _a, _b;
        if (((_b = (_a = e.constructor) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.indexOf("AssertionError")) >= 0) {
            this.captured.push(e);
        }
        else {
            throw e;
        }
    };
    SoftAssert.prototype.proxy = function (target) {
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
    };
    SoftAssert.prototype.proxyObj = function (target, original) {
        if (original === void 0) { original = target; }
        var self = this;
        if (!target) {
            return target;
        }
        return new Proxy(target, {
            get: function (_oTarget, sKey) {
                var _a, _b;
                var value;
                try {
                    value = original[sKey];
                }
                catch (e) {
                    self.capture(e);
                    return undefined;
                }
                if ((_a = value) === null || _a === void 0 ? void 0 : _a["catch"]) {
                    value = (_b = value) === null || _b === void 0 ? void 0 : _b["catch"](function (e) { return self.capture(e); });
                }
                return self.proxy(value);
            }
        });
    };
    SoftAssert.prototype.proxyFn = function (target) {
        var _a;
        var self = this;
        var wrapperFn = function () {
            var _this = this;
            var _a, _b;
            try {
                var value = self.proxy(target.apply(this, arguments));
                if ((_a = value) === null || _a === void 0 ? void 0 : _a["catch"]) {
                    return (_b = value) === null || _b === void 0 ? void 0 : _b["catch"](function (e) { return _this.capture(e); });
                }
                return value;
            }
            catch (e) {
                self.capture(e);
            }
        };
        var binding = (_a = {}, _a[target.name] = wrapperFn, _a)[target.name];
        binding.prototype = target.prototype;
        return binding;
    };
    SoftAssert.prototype.wrap = function (target) {
        var _a;
        var isAsync = target.constructor.name === "AsyncFunction";
        var params = target.length;
        var self = this;
        var wrapperFn = isAsync ?
            function () {
                return __awaiter(this, arguments, void 0, function () {
                    var e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, target.apply(this, arguments)];
                            case 1: return [2 /*return*/, _a.sent()];
                            case 2:
                                e_1 = _a.sent();
                                self.capture(e_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
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
        var binding = (_a = {}, _a[target.name] = wrapperFn, _a)[target.name];
        Object.defineProperty(binding, "length", {
            value: params
        });
        return binding;
    };
    SoftAssert.prototype.soft = function (target) {
        this.wrap(target)();
    };
    SoftAssert.prototype.flush = function () {
        if (this.captured.length > 1) {
            var message = "Total failures are: " + this.captured.length + "\n\n" + this.captured.map(formatAssertionError).join("\n\n");
            this.captured = [];
            throw new assert_1.AssertionError({ message: message });
        }
        else if (this.captured.length === 1) {
            var message = this.captured[0];
            this.captured = [];
            throw message;
        }
    };
    return SoftAssert;
}());
exports.SoftAssert = SoftAssert;
exports.softAssert = new SoftAssert();
exports.wrap = exports.softAssert.wrap.bind(exports.softAssert);
exports.proxy = exports.softAssert.proxy.bind(exports.softAssert);
exports.soft = exports.softAssert.soft.bind(exports.softAssert);
exports.flush = exports.softAssert.flush.bind(exports.softAssert);
