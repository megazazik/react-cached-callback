import { arraysEqual, getCache, setCache, ICachedParams } from './common';

const cachedFunctionFieldName = typeof Symbol === 'function' ? Symbol('react-cached-callback') : '__reactCachedCallbackFieldName__';

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
		return innerCached({getKey: params} as any);
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
				if (!this[cachedFunctionFieldName]) {
					this[cachedFunctionFieldName] = {}
				}
				let cache4Function = getCache(this[cachedFunctionFieldName], name, getCacheKey(...args));

				if (!cache4Function) {
					cache4Function = {};
					cache4Function.func = (...callArgs) => cache4Function.cached(...callArgs);
					setCache(this[cachedFunctionFieldName], name, getCacheKey(...args), cache4Function);
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

export function makeCached(Component: any, propertyName: string, params?: ICachedParams | number | ((...args) => (number | string | symbol))) {
	const prototype = (Component as Function).prototype;
	Object.defineProperty(
		prototype, 
		propertyName,
		cached(params as any)(
			prototype,
			propertyName,
			Object.getOwnPropertyDescriptor(prototype, propertyName)
		)
	)
}