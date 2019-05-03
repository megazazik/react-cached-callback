import initGetKey from '../getKey';
import test from 'tape';

test('getKey', (t) => {
    t.equal(initGetKey()(10, false), 10);
    t.equal(initGetKey()(11, false), 11);

    t.equal(initGetKey(1)(11, 5, 7), 5);
    t.equal(initGetKey(2)(11, 5, 1), 1);

    t.equal(initGetKey((...args) => args.join('_'))(11, false, 1), '11_false_1');

    t.equal(initGetKey({index: 0})(11, 5, 1), 11);
    t.equal(initGetKey({index: 2})(11, 5, 1), 1);

    t.equal(initGetKey({getKey: (...args) => args.join('_')})(11, false, 1), '11_false_1');
    t.equal(initGetKey({getKey: (...args) => args.join('_'), index: 1})(11, false, 2), '11_false_2');
    
    t.end();
});