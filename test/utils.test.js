import { InvalidParameterError } from '../src/error';
import {
  isDifferentActiveNode,
  formatString,
  debounce,
  getUpdatedPropertyList,
  stringify,
  numberfy,
  formatInitialVariableValue,
} from '../src/render/idyll-display/utils';
const expect = require('expect');

describe('isDifferentActiveNode tests', () => {
  it('should return true with just first node null', () => {
    const node1 = null;
    const node2 = { context: { someNode: 'idyllNode' } };

    expect(isDifferentActiveNode(node1, node2)).toBeTruthy();
  });

  it('should return true with just second node null', () => {
    const node1 = { context: { someNode: 'idyllNode' } };
    const node2 = null;

    expect(isDifferentActiveNode(node1, node2)).toBeTruthy();
  });

  it('should return false with both null and/or undefined', () => {
    expect(isDifferentActiveNode(null, null)).toBeFalsy();
    expect(isDifferentActiveNode(null, undefined)).toBeFalsy();
    expect(isDifferentActiveNode(undefined, null)).toBeFalsy();
    expect(isDifferentActiveNode(undefined, undefined)).toBeFalsy();
  });
});

describe('formatString tests', () => {
  it('should return empty string', () => {
    expect(formatString(null)).toBe('');
    expect(formatString(undefined)).toBe('');
    expect(formatString(2)).toBe('');
    expect(formatString('')).toBe('');
  });

  it('should format the value correctly and replace - with a space', () => {
    expect(formatString('hElLo')).toBe('Hello');
    expect(formatString('bucket-of-ice')).toBe('Bucket Of Ice');
    expect(formatString('Valid String')).toBe('Valid String');
    expect(formatString('mismatch-value test-2')).toBe('Mismatch Value Test 2');
  });
});

describe('getUpdatedPropertyList tests', () => {
  it('should return null with invalid parameters', () => {
    expect(getUpdatedPropertyList(null, 'valid', '')).toBe(null);
    expect(getUpdatedPropertyList('', 'valid', '')).toBe(null);
    expect(getUpdatedPropertyList('valid', null, '')).toBe(null);
    expect(getUpdatedPropertyList('valid', '', '')).toBe(null);
    expect(getUpdatedPropertyList(null, null, '')).toBe(null);
  });

  it('should return an updated properties list', () => {
    const node = {
      id: 1,
      properties: {
        title: { type: 'value', value: 'Title' },
        author: { type: 'value', value: 'Deirdre' },
      },
    };

    const result = getUpdatedPropertyList(node, 'title', 'updated!');
    const expected = {
      ...node.properties,
      title: { type: 'value', value: 'updated!' },
    };

    expect(result).toEqual(expected);
  });
});

describe('debounce tests', () => {
  it('should throw an error on invalid parameters', () => {
    expect(() => {
      debounce(null, null);
    }).toThrowError(InvalidParameterError);
    expect(() => {
      debounce(() => {}, null);
    }).toThrowError(InvalidParameterError);
    expect(() => {
      debounce(() => {}, 0);
    }).toThrowError(InvalidParameterError);
    expect(() => {
      debounce(() => {}, -10);
    }).toThrowError(InvalidParameterError);
  });

  it('should return a debounce function that performs the given function just once', () => {
    const doSomething = jest.fn();
    jest.useFakeTimers();
    const returnedFunction = debounce(doSomething, 750);

    returnedFunction();
    expect(doSomething).toHaveBeenCalledTimes(0); // call immediately

    for (let i = 0; i < 10; i++) {
      jest.advanceTimersByTime(300);
      returnedFunction();
    }
    expect(doSomething).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1000);
    expect(doSomething).toHaveBeenCalledTimes(1);
  });
});

describe('stringify tests', () => {
  it('should return null', () => {
    expect(stringify(null)).toBeNull();
    expect(stringify(undefined)).toBeUndefined();
  });

  it('should return empty string', () => {
    expect(stringify('')).toBe('');
  });

  it('should return numbers in quotes', () => {
    expect(stringify(-3)).toBe('-3');
    expect(stringify(0)).toBe('0');
    expect(stringify(200)).toBe('200');
  });

  it('should return booleans in quotes', () => {
    expect(stringify(true)).toBe('true');
    expect(stringify(false)).toBe('false');
  });

  it('should return objects in quotes', () => {
    expect(stringify([])).toBe('[]');
    expect(stringify({})).toBe('{}');
    expect(stringify({ baked: 'bread' })).toBe('{"baked":"bread"}');
    expect(stringify([1, 2, 3])).toBe('[1,2,3]');
  });

  it('should return string as is', () => {
    expect(stringify('hello\'"!')).toBe('hello\'"!');
  });
});

describe('numberfy tests', () => {
  it('should return null or undefined', () => {
    expect(numberfy(null)).toBeNull();
    expect(numberfy(undefined)).toBeUndefined();
  });

  it('should return a number', () => {
    expect(numberfy('          3')).toBe(3);
    expect(numberfy('3.123     \n ')).toBe(3.123);
    expect(numberfy('0')).toBe(0);
    expect(numberfy('-55')).toBe(-55);
    expect(numberfy(0)).toBe(0);
    expect(numberfy(55.66)).toBe(55.66);
    expect(numberfy(-10)).toBe(-10);

    // booleans
    expect(numberfy(true)).toBe(1);
    expect(numberfy(false)).toBe(0);
  });

  it('should return the original value', () => {
    expect(numberfy('abc')).toBe('abc');
    expect(numberfy('')).toBe('');
    expect(numberfy('2abc1')).toBe('2abc1');
    expect(numberfy('   ')).toBe('   ');
  });
});

describe('formatInitialVariableValue test', () => {
  it('should return null', () => {
    expect(
      formatInitialVariableValue(null, { initialValue: 3 }, '/absolutePath/')
    ).toBe(null);

    expect(
      formatInitialVariableValue(
        undefined,
        { initialValue: 3 },
        '/absolutePath/'
      )
    ).toBe(null);

    expect(
      formatInitialVariableValue(false, { initialValue: 3 }, '/absolutePath/')
    ).toBe(null);

    expect(
      formatInitialVariableValue(0, { initialValue: 3 }, '/absolutePath/')
    ).toBe(null);

    expect(
      formatInitialVariableValue({}, { initialValue: 3 }, '/absolutePath/')
    ).toBe(null);
  });

  it('var nodes with type value', () => {
    // regular strings
    let node = {
      id: 1,
      type: 'var',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'value', value: 'deirdre' },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe(
      '"deirdre"'
    );

    // number
    node = {
      id: 1,
      type: 'var',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'value', value: -3.456 },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe(-3.456);

    // quotes in quotes
    node = {
      id: 1,
      type: 'var',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'value', value: '""' },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe('""""');

    // empty
    node = {
      id: 1,
      type: 'var',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'value', value: '' },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe('""');
  });

  it('var nodes with type expression', () => {
    // regular
    let node = {
      id: 1,
      type: 'var',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'expression', value: '3 * 3' },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe(
      '`3 * 3`'
    );

    // variable
    node = {
      id: 1,
      type: 'var',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'expression', value: 'newVar' },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe(
      '`newVar`'
    );

    // object
    node = {
      id: 1,
      type: 'var',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'expression', value: '[]' },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe('`[]`');

    node = {
      id: 1,
      type: 'var',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'expression', value: '{"hi": "goodbye"}' },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe(
      '`{"hi": "goodbye"}`'
    );
  });

  it('nodes with null or undefined values', () => {
    // null
    let node = {
      id: 1,
      type: 'var',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'expression', value: null },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe(
      '`null`'
    );

    // undefined
    node = {
      id: 1,
      type: 'var',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'expression', value: undefined },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe(
      '`undefined`'
    );
  });

  it('derived nodes with type expression', () => {
    // regular
    let node = {
      id: 1,
      type: 'derived',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'expression', value: `otherVar * 3` },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe(
      '`otherVar * 3`'
    );

    // null
    node = {
      id: 1,
      type: 'derived',
      properties: {
        name: { type: 'value', value: 'state' },
        value: { type: 'expression', value: `null` },
      },
    };

    expect(formatInitialVariableValue(node, {}, '/projectPath/')).toBe(
      '`null`'
    );
  });

  it('data nodes with rowData already existing', () => {});

  it('data nodes with rowData not existing', () => {});
});

describe('formatCurrentVariableValue test', () => {});

describe('convertInputToIdyllValue test', () => {});

describe('readFile test', () => {});

describe('jsonParser test', () => {});
