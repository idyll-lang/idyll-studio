const DataStore = require('../src/main/data-store/data-store');
const expect = require('expect');

jest.mock('fs', () => {
  return {
    readFileSync: path => {
      throw 'testing error';
    },
    writeFileSync: (path, contents) => {}
  };
});

jest.mock('path', () => ({
  join: (dir, file) => dir + '/' + file
}));

jest.mock('electron', () => ({
  app: { getPath: () => 'path' },
  remote: { app: { getPath: () => 'path' } }
}));

describe('DataStore tests', () => {
  let store;
  beforeEach(() => {
    store = new DataStore();
    jest.resetModules();
  });

  it('should initialize a new store if the store file does not exist', () => {
    const data = store.data;
    expect(data.tokenUrls).toEqual([]);
    expect(data.lastOpenedProject).toEqual({
      filePath: null,
      lastOpened: null
    });
    expect(store.path).toEqual('path/project-data.json');
  });

  // it('should initialize the store with the project file contents', () => {
  //   jest.mock('fs', () => {
  //     return {
  //       readFileSync: path => ({
  //         tokenUrls: [{ token: 'abc', url: 'path/to/url.idyll' }],
  //         lastOpenedProject: {
  //           filePath: 'path/to/url.idyll',
  //           lastOpened: 11282019
  //         }
  //       })
  //     };
  //   });

  // });
});
