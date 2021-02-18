export const EXECUTE_KEY = 'Enter';

export const TEXT = 'Text';
export const INPUT = 'Input';
export const LAYOUT = 'Layout';
export const LOGIC = 'Logic';
export const PRESENTATION = 'Data and Code';
export const HELPERS = 'Helpers';
export const MEDIA = 'Media';

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
  ['step', LAYOUT],
  ['stepper-control', LAYOUT],
  ['text-container', TEXT],
  ['conditional', LOGIC],
  ['loop', LOGIC],
  ['switch', LOGIC],
  ['default', LOGIC],
  ['case', LOGIC],
  ['chart', PRESENTATION],
  ['cite', TEXT],
  ['display', PRESENTATION],
  ['desmos', PRESENTATION],
  ['equation', PRESENTATION],
  ['gist', PRESENTATION],
  ['graphic', PRESENTATION],
  ['header', MEDIA],
  ['h1', TEXT],
  ['h2', TEXT],
  ['h3', TEXT],
  ['h4', TEXT],
  ['h5', TEXT],
  ['h6', TEXT],
  ['link', TEXT],
  ['svg', MEDIA],
  ['image', MEDIA],
  ['table', PRESENTATION],
  ['tweet', MEDIA],
  ['youtube', MEDIA],
  ['code-highlight', PRESENTATION],
  ['analytics', HELPERS],
  ['meta', HELPERS],
  ['preload', HELPERS]
]);


export const EXCLUDED_COMPONENTS = ['generateHeaders', 'fixed', 'inline', 'scroller', 'step', 'stepper-control', 'case', 'default', 'graphic', 'analytics', 'meta', 'preload', 'stepper'];

export const DEBOUNCE_PROPERTY_MILLISECONDS = 250;
