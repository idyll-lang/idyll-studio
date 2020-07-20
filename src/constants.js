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
  ['step', LAYOUT],
  ['stepper-control', LAYOUT],
  ['text-container', LAYOUT],
  ['conditional', LOGIC],
  ['loop', LOGIC],
  ['switch', LOGIC],
  ['default', LOGIC],
  ['case', LOGIC],
  ['chart', PRESENTATION],
  ['cite', PRESENTATION],
  ['display', PRESENTATION],
  ['desmos', PRESENTATION],
  ['equation', PRESENTATION],
  ['gist', PRESENTATION],
  ['graphic', PRESENTATION],
  ['header', PRESENTATION],
  ['h1', PRESENTATION],
  ['h2', PRESENTATION],
  ['h3', PRESENTATION],
  ['h4', PRESENTATION],
  ['h5', PRESENTATION],
  ['h6', PRESENTATION],
  ['link', PRESENTATION],
  ['svg', PRESENTATION],
  ['table', PRESENTATION],
  ['tweet', PRESENTATION],
  ['youtube', PRESENTATION],
  ['code-highlight', PRESENTATION],
  ['analytics', HELPERS],
  ['meta', HELPERS],
  ['preload', HELPERS],
]);

export const EXCLUDED_COMPONENTS = ['generateHeaders'];
