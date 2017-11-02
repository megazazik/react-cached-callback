# react-cached-callback #
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

##Why?##
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
But sometimes you need to pass `onClickHandler` to a number of components in cycle. And onClickHandler needs to know an elements's index when it is executed.
`react-cached-callback` will help you to resolve this issue easy.

##How it works##
To use `react-cached-callback` you need to add method in `react` component which will create callbacks for each component rendered in `render` in cycle. `react-cached-callback` creates a number of high order functions for such callbacks and returns existed one of them if it is called with the same parameter in the second time.

##API##
To determine which cached callback should be returned `react-cached-callback` needs to know a key.
By default the first parameter is used as a key:
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
`index` is used as a key here. If `_onClick` is called with the same index next time the same high order function will be returned, so the `ChildComponent` will not be rerendered if it is pure.

###@cached({index: number})###
You can use any parameter as a key by specifying a parameter's index:
```javascript
@cached({index: 1})
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

###@cached({getKey: function})###
You can specify a function to calculate a key using passed parameters:
```javascript
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
In this case `getKey` will get the same paramethers as the `_onClick`.
If `getKey` is passed to `@cached` then the `index` parameter is ignored.

###@cached({pure: boolean})###
When cached property is called with the all same parameters in the next time it does not call the original `_onClick` function and used cached result. If at least one parameter is changed the original `_onClick` is called.
If you need to call the original `_onClick` each time you can specify a `pure` parameter to `false`:
```javascript
@cached({pure: false})
_onClick(obj) {
	return () => doSomething(obj);
}
```
It can be used with any other parameters.