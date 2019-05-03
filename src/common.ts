export function getCache(cache: object, functionName: string | symbol, key: string | number | symbol) {
	if (!cache[functionName]) {
		// создаем поля для хранения закешированных функций с таким именем
		cache[functionName]  = {};
	}

	return cache[functionName][key];
}

export function setCache(cache: object, functionName: string | symbol, key: string | number | symbol, cachedObj: any) {
	cache[functionName][key] = cachedObj;
}

export interface ICachedParams {
	/**
	 * index of argument which will be used as a cache key
	 * default value - 0
	 */
	index?: number;
	/**
	 * function to get key by arguments
	 */
	getKey?: (...args) => string | symbol | number;
	/**
	 * if pure is true, an original method will not be invoked if arguments are the same
	 * default value - true
	 */
	pure?: boolean;
}

export function arraysEqual(arr1: any[], arr2: any[]) {
	if (!arr1 || !arr2) {
		return false;
	}

	if (arr1.length != arr2.length) {
		return false;
	}

	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) {
			return false;
		}
	}

	return true;
}
