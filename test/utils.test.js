import { InvalidParameterError } from '../src/error';
import {
  isDifferentActiveNode,
  formatString,
  debounce,
  getUpdatedPropList,
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

describe('getUpdatedPropList tests', () => {
  it('should return null with invalid parameters', () => {
    expect(getUpdatedPropList(null, 'valid', '')).toBe(null);
    expect(getUpdatedPropList('', "valid", '')).toBe(null);
    expect(getUpdatedPropList('valid', null, '')).toBe(null);
    expect(getUpdatedPropList('valid', '', '')).toBe(null);
    expect(getUpdatedPropList(null, null, '')).toBe(null);
  });

  it('should return an updated properties list', () => {
    const node = {id:1, properties: {title: {type:'value', value:'Title'}, author: {type:'value', value:'Deirdre'}}};

    const result = getUpdatedPropList(node, 'title', 'updated!');
    const expected = { ...node.properties, title: {type:'value', value:'updated!'}};

    expect(result).toEqual(expected);
  })
});

describe('debounce tests', () => {
  it('should throw an error on invalid parameters', () => {
    expect(() => { debounce(null, null) }).toThrowError(InvalidParameterError);
    expect(() => { debounce(() => {}, null) }).toThrowError(InvalidParameterError);
    expect(() => { debounce(() => {}, 0) }).toThrowError(InvalidParameterError);
    expect(() => { debounce(() => {}, -10) }).toThrowError(InvalidParameterError);
  })

  it('should return a debounce function that performs the given function just once', () => {
    const doSomething = jest.fn();
    jest.useFakeTimers();
    const returnedFunction = debounce(doSomething, 750);
    
    returnedFunction();
    expect(doSomething).toHaveBeenCalledTimes(0); // call immediately
    
    for(let i = 0; i < 10; i++) {
      jest.advanceTimersByTime(300);
      returnedFunction();
    }
    expect(doSomething).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1000);
    expect(doSomething).toHaveBeenCalledTimes(1);
  })
});
