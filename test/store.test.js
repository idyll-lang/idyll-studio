const error = require('../src/error');
const expect = require('expect');

jest.mock('path', () => ({
  join: (dir, file) => dir + '/' + file
}));

jest.mock('electron', () => ({
  app: { getPath: () => 'path' },
  remote: { app: { getPath: () => 'path' } }
}));

describe('DataStore initialization tests', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should initialize a new store if the store file does not exist', () => {
    jest.doMock('fs', () => {
      return {
        readFileSync: path => {
          throw 'testing error';
        },
        writeFileSync: (path, contents) => {}
      };
    });

    const DataStore = require('../src/main/data-store/data-store');
    const store = new DataStore();

    // test data and path initiali values
    const data = store.data;
    expect(data.tokenUrls).toEqual([]);
    expect(data.lastOpenedProject).toEqual({
      filePath: null,
      lastOpened: null
    });
    expect(store.path).toEqual('path/project-data.json');
  });

  it('should initialize the store with the project file contents', () => {
    jest.doMock('fs', () => {
      return {
        readFileSync: path =>
          JSON.stringify({
            tokenUrls: [{ token: 'abc', url: 'path/to/url.idyll' }],
            lastOpenedProject: {
              filePath: 'another/path/to/url.idyll',
              lastOpened: 11282019
            }
          })
        // no need to mock writeFileSync
      };
    });

    const DataStore = require('../src/main/data-store/data-store');
    const store = new DataStore();

    const data = store.data;
    expect(data.tokenUrls).toEqual([
      { token: 'abc', url: 'path/to/url.idyll' }
    ]);
    expect(data.lastOpenedProject).toEqual({
      filePath: 'another/path/to/url.idyll',
      lastOpened: 11282019
    });
    expect(store.path).toEqual('path/project-data.json');
  });
});

describe('DataStore function tests', () => {
  let store;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('fs', () => ({
      readFileSync: path =>
        JSON.stringify({
          tokenUrls: [
            { token: 'abc', url: 'path/to/url.idyll' },
            {
              token: '123',
              url: '123/abc.idyll'
            }
          ],
          lastOpenedProject: {
            filePath: 'another/path/to/url.idyll',
            lastOpened: 11282019
          }
        }),
      writeFileSync: () => {}
    }));

    const DataStore = require('../src/main/data-store/data-store');
    store = new DataStore();
  });

  it('getTokenUrlByToken: should return a valid tokenUrl pair', () => {
    const result = store.getTokenUrlByToken('123');
    expect(result).toEqual({ token: '123', url: '123/abc.idyll' });
  });

  it('getTokenUrlByToken: should throw an InvalidParameterError on null and undefined', () => {
    try {
      store.getTokenUrlByToken(null);
      expect(true).toBeFalsy(); // should never be reached
    } catch (err) {
      expect(err.name).toBe('InvalidParameterError');
    }

    try {
      store.getTokenUrlByToken(undefined);
      expect(true).toBeFalsy(); // should never be reached
    } catch (err) {
      expect(err.name).toBe('InvalidParameterError');
    }
  });

  it('getTokenUrlByToken: should return new copy of store data', () => {
    const result = store.getTokenUrlByToken('123');
    result.token = '456';

    expect(result.token).toBe('456');
    expect(store.getTokenUrlByToken('456')).toBe(null);
  });

  it('getLastSessionProjectPath: should return the last opened project', () => {
    expect(store.getLastSessionProjectPath()).toBe('another/path/to/url.idyll');
  });

  it('addTokenUrlPair: should update this.data with the new token pair', () => {
    store.addTokenUrlPair('a-new-url.com', 'newToken');

    expect(store.getTokenUrlByToken('newToken')).toEqual({
      token: 'newToken',
      url: 'a-new-url.com'
    });
    expect(store.data.tokenUrls).toEqual([
      { token: 'abc', url: 'path/to/url.idyll' },
      {
        token: '123',
        url: '123/abc.idyll'
      },
      { token: 'newToken', url: 'a-new-url.com' }
    ]);
  });

  it('addTokenUrlPair: should throw an InvalidParameterError on null and undefined', () => {
    try {
      store.addTokenUrlPair(null, null);
      expect(true).toBeFalsy(); // should never be reached
    } catch (err) {
      expect(err.name).toBe('InvalidParameterError');
    }

    try {
      store.addTokenUrlPair(undefined, undefined);
      expect(true).toBeFalsy(); // should never be reached
    } catch (err) {
      expect(err.name).toBe('InvalidParameterError');
    }

    try {
      store.addTokenUrlPair('123', undefined);
      expect(true).toBeFalsy(); // should never be reached
    } catch (err) {
      expect(err.name).toBe('InvalidParameterError');
    }

    try {
      store.addTokenUrlPair('345', null);
      expect(true).toBeFalsy(); // should never be reached
    } catch (err) {
      expect(err.name).toBe('InvalidParameterError');
    }
  });

  it('updateLastOpenedProject: should update the last opened project', () => {
    const expected = '/new/project/path.idyll';
    store.updateLastOpenedProject(expected);
    expect(store.getLastSessionProjectPath()).toBe(expected);
  });

  it('updateLastOpenedProject: should throw an InvalidParameterError on null or undefined', () => {
    try {
      store.updateLastOpenedProject(null);
      expect(true).toBeFalsy(); // should never be reached
    } catch (err) {
      expect(err.name).toBe('InvalidParameterError');
    }

    try {
      store.updateLastOpenedProject(undefined);
      expect(true).toBeFalsy(); // should never be reached
    } catch (err) {
      expect(err.name).toBe('InvalidParameterError');
    }
  });
});
