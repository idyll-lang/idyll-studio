import fs from 'fs';
import {
  formatInitialVariableValue,
  formatCurrentVariableValue,
  wrapValue,
  convertInputToIdyllValue,
} from '../src/render/idyll-display/utils/variable-viewer-utils';
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

  it('should test var nodes with type value', () => {
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

  it('should test var nodes with type expression', () => {
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

  it('should test nodes with null or undefined values', () => {
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

  it('should test derived nodes with type expression', () => {
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

  it('should test data nodes with null rowData', () => {
    // json
    let node = {
      id: 1,
      type: 'data',
      properties: {
        name: { type: 'value', value: 'state' },
        source: { type: 'value', value: '/some/path/data/file.json' },
      },
    };

    expect(formatInitialVariableValue(node, null, '/some/path')).toStrictEqual([
      { a: 1, b: 2 },
      { a: 4, b: 100 },
    ]);

    // csv
    node = {
      id: 1,
      type: 'data',
      properties: {
        name: { type: 'value', value: 'state' },
        source: { type: 'value', value: '/some/path/data/file.csv' },
      },
    };

    expect(formatInitialVariableValue(node, null, '/some/path')).toStrictEqual(
      CSV_CONTENT_AS_JSON
    );
  });

  it('should test data nodes with rowData exist', () => {
    // json
    let node = {
      id: 1,
      type: 'data',
      properties: {
        name: { type: 'value', value: 'state' },
        source: { type: 'value', value: '/some/path/data/file.json' },
      },
    };

    expect(
      formatInitialVariableValue(
        node,
        { initialValue: JSON.parse(JSON_CONTENT) },
        '/some/path'
      )
    ).toStrictEqual([
      { a: 1, b: 2 },
      { a: 4, b: 100 },
    ]);
  });

  it('should test empty files', () => {
    // empty files
    let node = {
      id: 1,
      type: 'data',
      properties: {
        name: { type: 'value', value: 'state' },
        source: { type: 'value', value: '/some/path/data/empty.json' },
      },
    };

    expect(formatInitialVariableValue(node, null, '/some/path')).toStrictEqual(
      ''
    );
  });
});

describe('formatCurrentVariableValue test', () => {
  it('should wrap string values in quotes', () => {
    expect(formatCurrentVariableValue('hello')).toBe('"hello"');
    expect(formatCurrentVariableValue('"')).toBe('"""');
    expect(formatCurrentVariableValue('')).toBe('""');
  });

  it('should leave numbers, booleans, objects as is', () => {
    // numbers
    expect(formatCurrentVariableValue(3)).toBe(3);
    expect(formatCurrentVariableValue(0)).toBe(0);
    expect(formatCurrentVariableValue(-1.233435)).toBe(-1.233435);

    // booleans
    expect(formatCurrentVariableValue(true)).toBe(true);
    expect(formatCurrentVariableValue(false)).toBe(false);

    // objects
    expect(formatCurrentVariableValue([])).toStrictEqual([]);
    expect(formatCurrentVariableValue({})).toStrictEqual({});
    expect(formatCurrentVariableValue([1, 2, 3])).toStrictEqual([1, 2, 3]);
    expect(
      formatCurrentVariableValue([
        { a: 1, b: 'hi' },
        { a: false, b: 'two' },
      ])
    ).toStrictEqual([
      { a: 1, b: 'hi' },
      { a: false, b: 'two' },
    ]);
  });

  it('should leave null and undefined as is', () => {
    expect(formatCurrentVariableValue(null)).toBeNull();
    expect(formatCurrentVariableValue(undefined)).toBeUndefined();
  });
});

describe('wrapValue test', () => {
  it('should return the value without a wrapper', () => {
    // null/undefined
    expect(wrapValue(null, '')).toBeNull();
    expect(wrapValue(undefined, '')).toBeUndefined();

    // actual value
    expect(wrapValue('state', '')).toBe('state');
  });

  it('should return the value with a wrapper', () => {
    // null/undefined
    expect(wrapValue(null, "'")).toBe("'null'");
    expect(wrapValue(undefined, '`')).toBe('`undefined`');

    // actual value
    expect(wrapValue('state', '"')).toBe('"state"');
    expect(wrapValue([], '`')).toBe('`[]`');
  });
});

describe('convertInputToIdyllValue test', () => {
  it('should give back a value and type number', () => {
    expect(convertInputToIdyllValue('3.1')).toStrictEqual({
      type: 'value',
      value: 3.1,
    });

    expect(convertInputToIdyllValue('0')).toStrictEqual({
      type: 'value',
      value: 0,
    });

    expect(convertInputToIdyllValue('-10000.234')).toStrictEqual({
      type: 'value',
      value: -10000.234,
    });
  });

  it('should give back type boolean', () => {
    expect(convertInputToIdyllValue(true)).toStrictEqual({
      type: 'value',
      value: true,
    });

    expect(convertInputToIdyllValue(false)).toStrictEqual({
      type: 'value',
      value: false,
    });

    expect(convertInputToIdyllValue('false')).toStrictEqual({
      type: 'value',
      value: false,
    });

    expect(convertInputToIdyllValue('true')).toStrictEqual({
      type: 'value',
      value: true,
    });
  });

  it('should give back a value and type string', () => {
    expect(convertInputToIdyllValue("'hello'")).toStrictEqual({
      type: 'value',
      value: 'hello',
    });

    expect(convertInputToIdyllValue('"quotes"')).toStrictEqual({
      type: 'value',
      value: 'quotes',
    });

    expect(convertInputToIdyllValue('\'"""`\'')).toStrictEqual({
      type: 'value',
      value: '"""`',
    });

    expect(convertInputToIdyllValue('""')).toStrictEqual({
      type: 'value',
      value: '',
    });

    expect(convertInputToIdyllValue('"      "')).toStrictEqual({
      type: 'value',
      value: '      ',
    });
  });

  it('should give back a value and type expression', () => {
    // empty string
    expect(convertInputToIdyllValue('')).toStrictEqual({
      type: 'expression',
      value: '',
    });

    // object
    expect(convertInputToIdyllValue('[]')).toStrictEqual({
      type: 'expression',
      value: '[]',
    });

    expect(convertInputToIdyllValue('{}')).toStrictEqual({
      type: 'expression',
      value: '{}',
    });

    expect(convertInputToIdyllValue('[1, 2, 3]')).toStrictEqual({
      type: 'expression',
      value: '[1, 2, 3]',
    });
  });

  it('should give back null and undefined as is', () => {
    expect(convertInputToIdyllValue(null)).toStrictEqual({
      type: 'expression',
      value: null,
    });
    expect(convertInputToIdyllValue(undefined)).toStrictEqual({
      type: 'expression',
      value: undefined,
    });
  });
});
