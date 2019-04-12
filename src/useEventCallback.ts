import { useRef, useLayoutEffect, useCallback } from 'react';

export default function useEventCallback<C extends (...args) => any>(fn: C): C {
	const ref = useRef<(...args) => any>(() => {
		throw new Error('Cannot call an event handler while rendering.');
	});

	useLayoutEffect(() => {
		ref.current = fn;
	});

	return useCallback<(...args) => any>((...args) => {
		const fn = ref.current;
		return fn(...args);
	}, [ref]) as C;
}
