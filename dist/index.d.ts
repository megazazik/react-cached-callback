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
export default function cached<T>(prototype: Object, name: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T>;
export default function cached(params?: ICachedParams): <T>(prototype: Object, name: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
export default function cached(index: number): <T>(prototype: Object, name: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
export default function cached(getKey: (...args) => (number | string | symbol)): <T>(prototype: Object, name: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
export declare function makeCached(Component: any, propertyName: string, params?: ICachedParams | number | ((...args) => (number | string | symbol))): void;
