export type Params = number | ((...args) => (string | number | symbol)) | {
    index?: number;
    getKey?: (...args) => (number | string | symbol);
}

/** @todo добавить ошибки при неправильной передачи параметров, что может привести к ошибкам в это функции */
export default function initGetKey (params: Params = 0): (...args) => (string | number | symbol) {
    if (typeof params === 'number') {
        return (...args) => args[params];
    }

    if (typeof params === 'function') {
        return params as any;
    }

    if (typeof params === 'object') {
        if (params.getKey) {
            return params.getKey;
        } else {
            return (...args) => args[params.index || 0];
        }
    }
}