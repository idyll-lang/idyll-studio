export const JSON_CONTENT = '[{ "a": 1, "b": 2 }, { "a": 4, "b": 100 }]';

export const CSV_CONTENT =
  'a,b,c,d\n1,2,false,"four"\n4,5,true,"six"\n7,8,false,"nine"';

export const CSV_CONTENT_AS_JSON = [
  {
    a: 1,
    b: 2,
    c: 'false',
    d: 'four',
  },
  {
    a: 4,
    b: 5,
    c: 'true',
    d: 'six',
  },
  {
    a: 7,
    b: 8,
    c: 'false',
    d: 'nine',
  },
];
