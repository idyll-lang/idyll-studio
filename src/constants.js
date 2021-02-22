export const EXECUTE_KEY = 'Enter';

export const TEXT = 'Text';
export const INPUT = 'Reader Input';
export const LAYOUT = 'Layout';
export const LOGIC = 'Logic';
export const PRESENTATION = 'Data and Variables';
export const MATH_CODE = 'Math and Code';
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
  ['desmos', MATH_CODE],
  ['equation', MATH_CODE],
  ['gist', MATH_CODE],
  ['graphic', PRESENTATION],
  ['header', TEXT],
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
  ['code-highlight', MATH_CODE],
  ['analytics', HELPERS],
  ['meta', HELPERS],
  ['preload', HELPERS],
  ['vega-lite', PRESENTATION]
]);



export const COMPONENT_NAME_MAP = {
  'text container': 'Paragraph',
  'display': 'Display Value',
  'desmos': 'Graphing Calculator',
  'gist': 'GitHub Gist',
  'range': 'Range Slider',
  'boolean': 'Checkbox',
  'radio': 'Multiple Choice',
  'text input': 'Text Input',
  'select': 'Dropdown',
  'vega lite': 'Chart (Vega-Lite)'
}

export const EXCLUDED_COMPONENTS = ['generateHeaders', 'fixed', 'inline', 'scroller', 'step', 'stepper-control', 'case', 'default', 'graphic', 'analytics', 'meta', 'preload', 'stepper', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'chart'];

export const DEBOUNCE_PROPERTY_MILLISECONDS = 250;
