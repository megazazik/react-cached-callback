import { useRef, useEffect } from 'react';
import initGetKey, { Params } from './getKey';

export { Params };

export default function useGetEventCallback<C extends ((...args) => (...args) => any)> (
    createCallback: C,
    params?: Params
): C {
    return useGetEventCallbackInner(createCallback, initGetKey(params));

}

function useGetEventCallbackInner<C extends ((...args) => (...args) => any)> (
    createCallback: C,
    getCacheKey: (...args) => (number | string | symbol)
): C {
    const callbacksCache = useRef<object>();
    if (!callbacksCache.current) {
        callbacksCache.current = {};
    }

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
            cache4Function.cached = () => {
                if (typeof console !== 'undefined' && typeof console.warn === 'function') {
                    console.warn('useEventCallbacks. You should not call an event handler while rendering.');
                }
            };
            cache4Function.func = (...callArgs) => cache4Function.cached(...callArgs);
            callbacksCache.current[cacheKey] = cache4Function;
        }

        cache4Function.next = createCallback(...args);

        return cache4Function.func;
    }) as any;
}
