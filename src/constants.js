export const EXECUTE_KEY = 'Enter';

export const INPUT = 'Input';
export const LAYOUT = 'Layout';
export const LOGIC = 'Logic';
export const PRESENTATION = 'Presentation';
export const HELPERS = 'Helpers';

export const COMPONENTS_CATEGORY_MAP = new Map([
  ['action', INPUT],
  ['boolean', INPUT],
  ['button', INPUT],
  ['dynamic', INPUT],
  ['radio', INPUT],
  ['range', INPUT],
  ['select', INPUT],
  ['text-input', INPUT],
  ['aside', LAYOUT],
  ['full-width', LAYOUT],
  ['fixed', LAYOUT],
  ['float', LAYOUT],
  ['inline', LAYOUT],
  ['scroller', LAYOUT],
  ['stepper', LAYOUT],
  ['conditional', LOGIC],
  ['loop', LOGIC],
  ['switch', LOGIC],
  ['chart', PRESENTATION],
  ['cite', PRESENTATION],
  ['display', PRESENTATION],
  ['desmos', PRESENTATION],
  ['equation', PRESENTATION],
  ['gist', PRESENTATION],
  ['header', PRESENTATION],
  ['link', PRESENTATION],
  ['svg', PRESENTATION],
  ['table', PRESENTATION],
  ['tweet', PRESENTATION],
  ['youtube', PRESENTATION],
  ['analytics', HELPERS],
  ['meta', HELPERS],
  ['preload', HELPERS],
]);

// Input", ["
// ]  'Action',
//   'Boolean',
//   'Button',
//   'Dynamic',
//   'Radio',
//   'Range',
//   'Select',
//   'Text Input',
// ],
// Layout", ["
// ]  'Aside',
//   'Full Width',
//   'Fixed',
//   'Float',
//   'Inline',
//   'Scroller',
//   'Stepper',
// ],
// Logic", ["'Con]ditional'", 'Loop'", 'Switch'],
// Presentation", ["
// ]  'Chart',
//   'Cite',
//   'Display',
//   'Desmos',
//   'Equation',
//   'Gist',
//   'Header',
//   'Link',
//   'SVG',
//   'Table',
//   'Tweet',
//   'Youtube',
// ],
// Helpers", ["'Ana]lytics'", 'Meta'", 'Preload'],
