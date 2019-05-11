# react-cached-callback
`react-cached-callback` is a helper to remove arrow-functions and bind from cycles in `react` component's `render` method.

This package containes the following helpers:
* [cached](#cached) decorator ([makeCached](#makecached))
* [useGetCallback](#usegetcallback)
* [useEventCallback](#useeventcallback)
* [useGetEventCallback](#usegeteventcallback)

Example with `cached`:
```javascript
import cached from 'react-cached-callback';

class SomeComponent extends React.Component {
	@cached
	_onClick(index) {
		return () => doSomething(index);
	}

	render() {
		return (
			<div>
				{someArray.map((obj, index) => (
					<ChildComponent onClick={this._onClick(index)} />
				))}
			</div>
		);
	}
}
```

Example with `useGetCallback`:
```javascript
import { useGetCallback } from 'react-cached-callback';

function SomeComponent ({someProp}) {
	const getOnClick = useGetCallback(
		(index) => () => {
			doSomething(index, someProp);
		},
		[someProp]
	);
	
	return (
		<div>
			{someArray.map((obj, index) => (
				<ChildComponent onClick={getOnClick(index)} />
			))}
		</div>
	);
}
```

## Why?
It is not recomended to create new functions in each `render` function call in `react` and pass them to child components. That is because of performance optimization reasons. Performance decrease can happen when you use arrow-function or bind in `render` function. Usualy you can easy avoid this by creating a component's property with an arrow-function:
```javascript
class SomeComponent extends React.Component {
	_onClickHandler = () => {
		...
	}

	render() {
		return (
			<div >
				<ChildComponent onClick={this._onClickHandler} />
			</div>
		);
	}
}
```
But sometimes you need to pass `onClickHandler` to a number of components in cycle. And `onClickHandler` needs to know an elements's index when it is executed.
`react-cached-callback` will help you to resolve this issue easy.

## @cached

### How it works
To use `cached` you need to add into a component a method  which creates callbacks for each component rendered in cycle. Then you need to decorate it with `cached`. For example:
```javascript
@cached
_createOnClick(index) {
	return () => doSomething(index);
}

render() {
	return (
		<div>
			{someArray.map((obj, index) => (
				<ChildComponent onClick={this._createOnClick(index)} />
			))}
		</div>
	);
}
```
When `_createOnClick` is called with some index for the first time `cached` saves a callback returned by original `_createOnClick`, creates a wrapper for it and returns the wrapper.  
When `_createOnClick` is called with the same index next time `cached` gets a new callback from the original `_createOnClick`, save it and returns the wrapper which was created earlier. When the wrapper is called it calls a callback which was returned by original `_createOnClick` last time.

To determine a wrapper which should be returned `cached` uses a *key*. In the example above the first parameter (`index`) is used as a key. You can specify an other key. See *Parameters* section for more details.

### Parameters
The `cached` decorator can be used with one parameter or without it. This parameter can be an object, a number or a function.
```javascript
// with object with parameters
@cached({index: 1, pure: false})

// with number
@cached(1)

// with function
@cached((obj) => obj.id)

// without parameters
@cached
//or
@cached()
```

You can pass the following parameters to `cached`:
* *index* (number) - index of an parameter which will be used as a key
* *getKey* (function) - function to calculate a key. It cannot be used with *index*.
* *pure* (boolean) - if *pure* is true `cached` will not call the original method to get a callback if it is called with the same parameters next time.

#### no parameters
If `cached` is used without parameters the first parameter is used as a key:
```javascript
@cached
_onClick(index) {
	return () => doSomething(index);
}

render() {
	return (
		<div>
			{someArray.map((obj, index) => (
				<ChildComponent onClick={this._onClick(index)} />
			))}
		</div>
	);
}
```
`index` is used as a key here. If `_onClick` is called with the same index next time the same wrapper will be returned.

#### index
You can use any parameter as a key by specifying a parameter's index
```javascript
@cached({index: 1})
// or 
@cached(1)
_onClick(obj, index) {
	return () => doSomething(obj);
}

render() {
	return (
		<div>
			{someArray.map((obj, index) => (
				<ChildComponent onClick={this._onClick(obj, index)} />
			))}
		</div>
	);
}
```

#### getKey
You can specify a function to calculate a key using passed parameters:
```javascript
@cached((obj) => obj.id)
// or
@cached({getKey: (obj) => obj.id})
_onClick(obj) {
	return () => doSomething(obj);
}

render() {
	return (
		<div>
			{someArray.map((obj) => (
				<ChildComponent onClick={this._onClick(obj)} />
			))}
		</div>
	);
}
```
The `getKey` gets the same parameters as the original method. In this case the `getKey` will get one parameter - `obj`, and the obj's id will be used as a key.  
If `getKey` is passed to `@cached` then the `index` parameter is ignored.

#### pure
When a wrapper is called with all the same parameters in the next time it does not call the original `_onClick` function and used cached result. If at least one parameter is changed the original `_onClick` is called.
If you need to call the original `_onClick` each time you can specify a `pure` parameter to `false`:
```javascript
@cached({pure: false})
_onClick(obj) {
	return () => doSomething(obj);
}
```

### makeCached
if you cannot use decorators you can use a helper function `makeCached`. It has the follofing interface:  
makeCached(component: object, methodName: string, params?: object)  

* *component* - react component class (or some other class)
* *methodName* - method's name which should be cached
* *params* - the same parameters which the `cached` decorator gets

#### without parameters
```javascript
import { makeCached } from 'react-cached-callback';

class SomeComponent extends React.Component {
	_onClick(index) {
		return () => doSomething(index);
	}

	render() {
		return (
			<div>
				{someArray.map((obj, index) => (
					<ChildComponent onClick={this._onClick(index)} />
				))}
			</div>
		);
	}
}

makeCached(SomeComponent, '_onClick');
```

#### index
```
makeCached(SomeComponent, '_onClick', {index: 1});
// or 
makeCached(SomeComponent, '_onClick', 1);
```

#### getKey
```
makeCached(SomeComponent, '_onClick', {getKey: (obj) => obj.id});
// or 
makeCached(SomeComponent, '_onClick', (obj) => obj.id);
```

#### pure
```
makeCached(SomeComponent, '_onClick', {pure: false);
```

## useGetCallback
The `useGetCallback` hook is similar to react's `useCallback` hook, but `useGetCallback` helps to create several callbacks in cycles.

```javascript
import { useGetCallback } from 'react-cached-callback';

function SomeComponent ({someProp}) {
	const getOnClick = useGetCallback(
		(obj) => () => {
			doSomething(obj, someProp);
		},
		(obj) => obj.id,
		[someProp]
	);
	
	return (
		<div>
			{someArray.map((obj) => (
				<ChildComponent onClick={getOnClick(obj)} />
			))}
		</div>
	);
}
```

After each render `useGetCallback` saves created callbacks and return them during next render. To determine which callback should be returned `useGetCallback` uses a *key*. By default the first parameter is used as a key. An object's id  is used as a key in the example above.

You can pass the following parameters to `useGetCallback`:
* *getCallback* (function) - this function should return a callback.
* *keyIndex* (number) or *getKey* (function) *optional* - index of a parameter which should be used as a key or a function which should return a key. The `getKey` function gets all the same parameters as the function which creates callbacks.
* *dependencies* (array) *optional* - values which are used in callback. It is similar to dependencies of react's `useCallback`.

`useGetCallback` returns a new callback for some key each time when one of dependencies or call parameters (`callParams` in the example below) are changed.

```javascript
const getCallback = useGetCallback(
	(...callParams) => {
		return () => doSomething(...callParams)
	},
	dependencies
);
```

## useEventCallback
The `useEventCallback` hook can be used as the react's `useCallback` to create only one callback. But unlike the `useCallback` the `useEventCallback` doesn't create a new callback when any dependencies are changed. It always returns the same function.

The `useEventCallback` gets only one parameter - a callback.

```javascript
const callback = useEventCallback(
	(callParams) => { doSomething(...callParams) }
);
```

The `useEventCallback` always returns the same function so rendering process is more optimized because children components can rerender less often. But this can be a reason of bugs in async mode. So you should not use such callbacks early then rendering is finished. You can use them on UI events like `onClick`, `onHover` and after render - in `useEffect`. Using them during `useLayoutEffect` or `componentDidMount` / `componentDidUpdate` also can be causing bugs.

## useGetEventCallback
`useGetEventCallback` can be used to create many callback in cycles as `useGetCallback`. But it doesn't create a new callback when any dependencies or parameters changes. As `useEventCallback` you should not use callbacks created by `useGetEventCallback` before render finishes.

You can pass the following parameters to `useGetEventCallback`:
* *getCallback* (function) - this function should return a callback.
* *keyIndex* (number) or *getKey* (function) *optional* - index of a parameter which should be used as a key or a function which should return a key. By default the first paramether is used as a key. The `getKey` function gets all the same parameters as the function which creates callbacks.

```javascript
const getOnClick = useGetEventCallback(
	(obj) => {
		return () => doSomething(obj)
	},
	(obj) => obj.id
);
```
