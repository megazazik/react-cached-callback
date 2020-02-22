import { useRef, useCallback } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export default function useEventCallback<C extends (...args) => any>(fn: C): C {
	const ref = useRef<(...args) => any>(() => {
		if (
			typeof console !== 'undefined' &&
			typeof console.warn === 'function'
		) {
			console.warn(
				'useEventCallback. You should not call an event handler while rendering.'
			);
		}
	});

	useIsomorphicLayoutEffect(() => {
		ref.current = fn;
	});

	return useCallback<(...args) => any>(
		(...args) => {
			const fn = ref.current;
			return fn(...args);
		},
		[ref]
	) as C;
}
