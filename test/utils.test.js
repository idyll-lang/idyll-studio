import fs from 'fs';
import { InvalidParameterError } from '../src/error';
import {
  isDifferentActiveNode,
  formatString,
  debounce,
  getUpdatedPropertyList,
  stringify,
  numberfy,
  boolify,
  readFile,
  jsonParser,
} from '../src/render/idyll-display/utils';
import { JSON_CONTENT, CSV_CONTENT, CSV_CONTENT_AS_JSON } from './utils';

const expect = require('expect');
const p = require('path');

jest.mock('fs');
fs.readFileSync = (fpath, opts) => {
  if (p.basename(fpath) === 'empty.json') {
    return '';
  }

  const extension = p.extname(fpath);
  if (extension === '.json') {
    return JSON_CONTENT;
  } else if (extension === '.csv') {
    return CSV_CONTENT;
  }
};

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
    expect(stringify(null)).toBe('null');
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
  });

  it('should return the original value', () => {
    expect(numberfy('abc')).toBe('abc');
    expect(numberfy('')).toBe('');
    expect(numberfy('2abc1')).toBe('2abc1');
    expect(numberfy('   ')).toBe('   ');

    // booleans
    expect(numberfy(true)).toBe(true);
    expect(numberfy(false)).toBe(false);
  });
});

describe('boolify tests', () => {
  it('should return back a boolean', () => {
    expect(boolify(true)).toBeTruthy();
    expect(boolify('true')).toBeTruthy();
    expect(boolify(false)).toBeFalsy();
    expect(boolify('false')).toBeFalsy();
  });

  it('should return back the original value', () => {
    expect(boolify('')).toBe('');
    expect(boolify(null)).toBe(null);
    expect(boolify(undefined)).toBe(undefined);
    expect(boolify('hello')).toBe('hello');
    expect(boolify('3')).toBe('3');
    expect(boolify(3)).toBe(3);
    expect(boolify('True')).toBe('True');
  });
});

describe('readFile test', () => {
  it('should return null', () => {
    expect(readFile(null)).toStrictEqual({
      content: null,
      error: 'Source file is invalid. Cannot read file',
    });
    expect(readFile(undefined)).toStrictEqual({
      content: null,
      error: 'Source file is invalid. Cannot read file',
    });
    expect(readFile('')).toStrictEqual({
      content: null,
      error: 'Source file is invalid. Cannot read file',
    });
    expect(readFile([1, 2, 3])).toStrictEqual({
      content: null,
      error: 'Source file is invalid. Cannot read file',
    });
  });

  it('should return json contents', () => {
    expect(readFile('/stuff.json')).toStrictEqual({
      content: JSON_CONTENT,
      error: null,
    });
  });

  it('should return csv contents in json format', () => {
    expect(readFile('/stuff.csv')).toStrictEqual({
      content: JSON.stringify(CSV_CONTENT_AS_JSON),
      error: null,
    });
  });
});

describe('jsonParser test', () => {
  it('should parse the json as expected', () => {
    expect(jsonParser('[]')).toStrictEqual([]);
    expect(jsonParser('{}')).toStrictEqual({});
    expect(jsonParser(JSON.stringify(CSV_CONTENT_AS_JSON))).toStrictEqual(
      CSV_CONTENT_AS_JSON
    );
    expect(jsonParser('"hi"')).toStrictEqual('hi');
    expect(jsonParser(null)).toStrictEqual(null);
  });

  it('should return the original value', () => {
    expect(jsonParser(undefined)).toBeUndefined();
    expect(jsonParser(3)).toBe(3);
    expect(jsonParser('hello')).toBe('hello');
  });
});
