const { isDifferentActiveNode } = require('../src/render/idyll-display/utils');
const expect = require('expect');

describe('isDifferentActiveNode tests', () => {
  it('should return true with first node null', () => {
    const node1 = null;
    const node2 = { context: { someNode: 'idyllNode' } };

    expect(isDifferentActiveNode(node1, node2)).toBeTruthy();
  });

  it('should return true with second node null', () => {
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
