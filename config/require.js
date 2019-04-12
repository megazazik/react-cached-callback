
const { configure } = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const jsdomGlobal = require('jsdom-global');

jsdomGlobal();

configure({ adapter: new Adapter() });