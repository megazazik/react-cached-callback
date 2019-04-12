import { useRef, useEffect } from 'react';
import { ICachedParams, getCache, setCache, arraysEqual } from './common';

const FUNCTION_NAME = 'callback';

/** @todo добавить удаление ненужных колбеков после рендера */

export default function useCallbacks<C extends ((...args) => (...args) => any)> (
    createCallback: C,
    params?: ICachedParams | number | ((...args) => (number | string | symbol))
): C {
    if (typeof params === 'number') {
		return useInnerCallbacks(createCallback, {index: params});
	} else if (typeof params === 'function') {
		return useInnerCallbacks(createCallback, {getKey: params});
	} else {
		return useInnerCallbacks(createCallback, params);
	}
}

function useInnerCallbacks<C extends ((...args) => (...args) => any)> (
    createCallback: C,
    { index = 0, getKey, pure = true }: ICachedParams = {}
): C {
    const callbacksCache = useRef<object>();
    if (!callbacksCache.current) {
        callbacksCache.current = {};
    }

    const getCacheKey = getKey || ((...args) => args[index]);

    return ((...args) => {
        let cache4Function = getCache(callbacksCache.current, FUNCTION_NAME, getCacheKey(...args));

        if (!cache4Function) {
            cache4Function = {};
            cache4Function.func = (...callArgs) => cache4Function.cached(...callArgs);
            setCache(callbacksCache.current, FUNCTION_NAME, getCacheKey(...args), cache4Function);
        }

        if (!pure || !arraysEqual(args, cache4Function.args)) {
            cache4Function.args = args;
            cache4Function.cached = createCallback.apply(this, args);
        }

        return cache4Function.func;
    }) as any;
}
