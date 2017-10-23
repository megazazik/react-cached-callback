export interface ICachedParams {
    index?: number;
    getKey?: (...args) => string | symbol | number;
    pure?: boolean;
}
/**
 * Фабрика декораторов для кеширования возвращаемых функций
 * @param key индекс параметра, который будет использован как ключ или функция, которая возвращает ключ на основе параметров
 */
export default function cached({index, getKey, pure}?: ICachedParams): <T>(prototype: Object, name: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
    enumerable: boolean;
    configurable: boolean;
    writable: boolean;
    value: (...args: any[]) => any;
};
