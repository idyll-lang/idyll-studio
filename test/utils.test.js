import {
  isDifferentActiveNode,
  formatString,
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
