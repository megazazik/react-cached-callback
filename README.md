# todo Дописать readme
# todo Поднять версию на мажор
# react-cached-callback
`react-cached-callback` is a helper to remove arrow-functions and bind from cycles in `react` component's `render` method.
Example:
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

## How it works
To use `react-cached-callback` you need to add into a component a method  which will create callbacks for each component rendered in cycle. Then you need to decorate it with `cached`. For example:
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
When `_createOnClick` is called with some index for the first time `react-cached-callback` saves a callback returned by original `_createOnClick`, creates a wrapper for it and returns the wrapper.  
When `_createOnClick` is called with the same index next time `react-cached-callback` gets a new callback from the original `_createOnClick`, save it and returns the wrapper which was created earlier. When the wrapper is called it calls a callback which was returned by original `_createOnClick` last time.

To determine a wrapper which should be returned `react-cached-callback` uses a *key*. In the example above the first argument (`index`) is used as a key. You can specify an other key. See API for more details.

## API
The `cached` decorator can be used with one argument or without it. This argument can be an object, a number or a function.
```javascript
// with object with parameters
@cached({index: 1, pure: false})

// with number
@cached(1)

// with function
@cached((obj) => obj.id)

// without arguments
@cached
//or
@cached()
```

### Parameters
You can pass the following parameters to `cached`:
* *index* (number) - index of an argument which will be used as a key
* *getKey* (function) - function to calculate a key. It cannot be used with *index*.
* *pure* (boolean) - if *pure* is true `react-cached-callback` will not call the original method to get a callback if it is called with the same parameters next time.

### no arguments
If `react-cached-callback` is used without arguments the first parameter is used as a key:
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

### index
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

### getKey
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

### pure
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