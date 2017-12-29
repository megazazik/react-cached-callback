"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cachedFunctionFieldName = typeof Symbol === 'function' ? Symbol('react-cached-callback') : '__reactCachedCallbackFieldName__';
function getCache(obj, functionName, key) {
    var cache = obj[cachedFunctionFieldName];
    if (!cache) {
        // создаем поля для хранения закешированных значений этого объекта
        obj[cachedFunctionFieldName] = cache = {};
    }
    var functionsCache = cache[functionName];
    if (!functionsCache) {
        // создаем поля для хранения закешированных функций с таким именем
        cache[functionName] = functionsCache = {};
    }
    return functionsCache[key];
}
function setCache(obj, functionName, key, cachedObj) {
    obj[cachedFunctionFieldName][functionName][key] = cachedObj;
}
function cached(params, name, descriptor) {
    if (typeof params === 'number') {
        return innerCached({ index: params });
    }
    else if (typeof params === 'function') {
        return innerCached({ getKey: params });
    }
    else if (descriptor === undefined) {
        return innerCached(params);
    }
    else {
        return innerCached()(params, name, descriptor);
    }
}
exports.default = cached;
function innerCached(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.index, index = _c === void 0 ? 0 : _c, getKey = _b.getKey, _d = _b.pure, pure = _d === void 0 ? true : _d;
    var getCacheKey = getKey ?
        getKey :
        function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return args[index];
        };
    return function (prototype, name, descriptor) {
        return {
            enumerable: false,
            configurable: true,
            writable: false,
            value: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var cache4Function = getCache(this, name, getCacheKey.apply(void 0, args));
                if (!cache4Function) {
                    cache4Function = {};
                    cache4Function.func = function () {
                        var callArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            callArgs[_i] = arguments[_i];
                        }
                        return cache4Function.cached.apply(cache4Function, callArgs);
                    };
                    setCache(this, name, getCacheKey.apply(void 0, args), cache4Function);
                }
                if (!pure || !arraysEqual(args, cache4Function.args)) {
                    cache4Function.args = args;
                    cache4Function.cached = descriptor.value.apply(this, args);
                }
                return cache4Function.func;
            }
        };
    };
}
function arraysEqual(arr1, arr2) {
    if (!arr1 || !arr2) {
        return false;
    }
    if (arr1.length != arr2.length) {
        return false;
    }
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}
function makeCached(Component, propertyName, params) {
    var prototype = Component.prototype;
    Object.defineProperty(prototype, propertyName, cached(params)(prototype, propertyName, Object.getOwnPropertyDescriptor(prototype, propertyName)));
}
exports.makeCached = makeCached;
//# sourceMappingURL=index.js.map