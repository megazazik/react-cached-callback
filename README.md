# react-cached-callback #

Example:
```
import * as React from 'react'
import cached from 'react-cached-callback';

class SomeComponent extends React.Component {
	@cached()
	private _onClick(index) {
		return () => doSomething(index);
	}

	render() {
		return (
			<div>
				{someArray.map((obj, index) => (
					<span onClick={this._onClick(index)} >{obj.name}</span>
				))}
			</div>
		);
	}
}
```