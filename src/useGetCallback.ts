import { useRef, useEffect } from 'react';
import { getCache, setCache, arraysEqual } from './common';
import initGetKey, { Params } from './getKey';

const FUNCTION_NAME = 'callback';

export default function useGetCallback<C extends (...args) => (...args) => any>(
	createCallback: C,
	params?: Params,
	usedValues?: any[]
): C;
export default function useGetCallback<C extends (...args) => (...args) => any>(
	createCallback: C,
	usedValues?: any[]
): C;
export default function useGetCallback<C extends (...args) => (...args) => any>(
	createCallback: C,
	params?: Params | any[],
	_usedValues?: any[]
): C {
	const [initGetKeyParams, usedValues] = checkParams(params, _usedValues);
	return useGetCallbackInner(
		createCallback,
		initGetKey(initGetKeyParams),
		usedValues
	);
}

export function useGetCallbackInner<C extends (...args) => (...args) => any>(
	createCallback: C,
	getKey: (...args) => number | string | symbol,
	usedValues: any[]
): C {
	const callbacksCache = useRef<object>();
	if (!callbacksCache.current) {
		callbacksCache.current = { [FUNCTION_NAME]: {} };
	}

	const usedValuesRef = useRef<any[]>();
	const isNewValues = !arraysEqual(
		usedValuesRef.current || [],
		usedValues || []
	);
	usedValuesRef.current = usedValues;

	useEffect(() => {
		// update old and clear unused callbacks
		Object.keys(callbacksCache.current[FUNCTION_NAME]).forEach(cacheKey => {
			if (callbacksCache.current[FUNCTION_NAME][cacheKey].yetActual) {
				delete callbacksCache.current[FUNCTION_NAME][cacheKey]
					.yetActual;
			} else {
				delete callbacksCache.current[FUNCTION_NAME][cacheKey];
			}
		});
	});

	return ((...args) => {
		let cache4Function = getCache(
			callbacksCache.current,
			FUNCTION_NAME,
			getKey(...args)
		);

		if (
			!cache4Function ||
			isNewValues ||
			!arraysEqual(cache4Function.args, args)
		) {
			cache4Function = {};
			cache4Function.func = (...callArgs) =>
				cache4Function.cached(...callArgs);
			cache4Function.args = args;
			setCache(
				callbacksCache.current,
				FUNCTION_NAME,
				getKey(...args),
				cache4Function
			);
		}

		cache4Function.cached = createCallback.apply(this, args);
		cache4Function.yetActual = true;

		return cache4Function.func;
	}) as any;
}

export function checkParams(
	params?: Params | any[],
	usedParams?: any[]
): [Params, any[]] {
	return Array.isArray(params) ? [undefined, params] : [params, usedParams];
}
