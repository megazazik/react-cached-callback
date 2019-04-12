import { useRef, useEffect } from 'react';

export interface IEventCallbacksParams {
    /**
	 * index of argument which will be used as a cache key
	 * default value - 0
	 */
	index?: number;
	/**
	 * function to get key by arguments
	 */
	getKey?: (...args) => string | symbol | number;
}

export default function useEventCallbacks<C extends ((...args) => (...args) => any)> (
    createCallback: C,
    params?: IEventCallbacksParams | number | ((...args) => (number | string | symbol))
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
    { index = 0, getKey }: IEventCallbacksParams = {}
): C {
    const callbacksCache = useRef<object>();
    if (!callbacksCache.current) {
        callbacksCache.current = {};
    }

    const getCacheKey = getKey || ((...args) => args[index]);

    useEffect(() => {
        // update old and clear unused callbacks
        Object.keys(callbacksCache.current).forEach((cacheKey) => {
            if (callbacksCache.current[cacheKey].next) {
                callbacksCache.current[cacheKey].cached = callbacksCache.current[cacheKey].next;
                delete callbacksCache.current[cacheKey].next;
            } else {
                delete callbacksCache.current[cacheKey];
            }
        })
    });

    return ((...args) => {
        const cacheKey = getCacheKey(...args);
        let cache4Function = callbacksCache.current[cacheKey];

        if (!cache4Function) {
            cache4Function = {};
            cache4Function.cached = () => { throw new Error('Cannot call an event handler while rendering.'); };
            cache4Function.func = (...callArgs) => cache4Function.cached(...callArgs);
            callbacksCache.current[cacheKey] = cache4Function;
        }

        cache4Function.args = args;
        cache4Function.next = createCallback(...args);

        return cache4Function.func;
    }) as any;
}
