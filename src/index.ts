const cachedFunctionFieldName = typeof Symbol === 'function' ? Symbol('react-cached-callback') : '__reactCachedCallbackFieldName__';

function getCache(obj: object, functionName: string | symbol, key: string | number | symbol) {
	let cache = obj[cachedFunctionFieldName];
	if (!cache) {
		// создаем поля для хранения закешированных значений этого объекта
		obj[cachedFunctionFieldName] = cache = {};
	}

	let functionsCache = cache[functionName];
	if (!functionsCache) {
		// создаем поля для хранения закешированных функций с таким именем
		cache[functionName] = functionsCache = {};
	}

	return functionsCache[key];
}

function setCache(obj: object, functionName: string | symbol, key: string | number | symbol, cachedObj: any) {
	obj[cachedFunctionFieldName][functionName][key] = cachedObj;
}



export interface ICachedParams {
	/**
	 * индекс параметра, который будет использован как ключ при получении закешированной функции
	 * по умолчанию - 0
	 */
	index?: number;
	/**
	 * функция, которая будет использована для получение ключа кеша
	 */
	getKey?: (...args) => string | symbol | number;
	/**
	 * признак тог, что кешируемую функцию можно считать чистой и не вызывать ее снова при получении тех же параметров
	 * по умолчанию - true
	 */
	pure?: boolean;
}

/**
 * Фабрика декораторов для кеширования возвращаемых функций
 * @param params параметры декоратора
 */
export default function cached<T>(
	prototype: Object, 
	name: string | symbol, 
	descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T>;
export default function cached(params?: ICachedParams): 
	<T>(
		prototype: Object, 
		name: string | symbol, 
		descriptor: TypedPropertyDescriptor<T>
	) => TypedPropertyDescriptor<T>;
export default function cached(index: number): 
	<T>(
		prototype: Object, 
		name: string | symbol, 
		descriptor: TypedPropertyDescriptor<T>
	) => TypedPropertyDescriptor<T>;
export default function cached(getKey: (...args) => (number | string | symbol)): 
	<T>(
		prototype: Object, 
		name: string | symbol, 
		descriptor: TypedPropertyDescriptor<T>
	) => TypedPropertyDescriptor<T>;
export default function cached<T>(
	params?: ICachedParams | Object | number | ((...args) => (number | string | symbol)), 
	name?: string | symbol, 
	descriptor?: TypedPropertyDescriptor<T>
) {
	if (typeof params === 'number') {
		return innerCached({index: params});
	} else if (typeof params === 'function') {
		return innerCached({getKey: params});
	} else if (descriptor === undefined) {
		return innerCached(params);
	} else {
		return innerCached()(params, name, descriptor);
	}
}

function innerCached({ index = 0, getKey, pure = true }: ICachedParams = {}) {
	const getCacheKey = getKey ?
		getKey :
		(...args) => args[index];
	return <T>(prototype: Object, name: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> => {
		return {
			enumerable: false,
			configurable: true,
			writable: false,
			value: function (...args) {
				let cache4Function = getCache(this, name, getCacheKey(...args));

				if (!cache4Function) {
					cache4Function = {};
					cache4Function.func = (...callArgs) => cache4Function.cached(...callArgs);
					setCache(this, name, getCacheKey(...args), cache4Function);
				}

				if (!pure || !arraysEqual(args, cache4Function.args)) {
					cache4Function.args = args;
					cache4Function.cached = (descriptor.value as any as Function).apply(this, args);
				}

				return cache4Function.func;
			}
		} as any;
	};
}

function arraysEqual(arr1: any[], arr2: any[]) {
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