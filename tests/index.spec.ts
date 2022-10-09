import 'mocha';
import { assert } from 'chai';

import { classNames } from '../src/index';

describe('classNames', () => {
  it('should compose class names', () => {
    const expected = 'cx-1 cx-2';
    const actual = classNames`cx-1 cx-2`;
    assert.equal(actual, expected);
  });
});
