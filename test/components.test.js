import * as React from 'react';
import { shallow } from 'enzyme';
import { Property } from '../src/render/idyll-display/components/property';
import expect from 'expect';
import PropertyList from '../src/render/idyll-display/components/property-list';

describe('<Property /> with props', () => {
  let component;
  let updateProperty;

  let updateNodeType;
  let updateShowPropDetailsMap;

  const dropTarget = jest.fn(jsxElement => jsxElement);

  beforeEach(() => {
    updateProperty = jest.fn((propertyName, value, e) => [propertyName, value]);

    updateNodeType = jest.fn((name, nextType) => [name, nextType]);

    updateShowPropDetailsMap = jest.fn();
  });

  it('renders with just the returned div with the prop name and color and opens div on click', () => {
    component = shallow(
      <Property
        updateProperty={updateProperty}
        name={'author'}
        value={{ value: '', type: 'variable' }}
        updateNodeType={updateNodeType}
        variableData={{}}
        updateShowPropDetailsMap={updateShowPropDetailsMap}
        showDetails={false}
        activePropName={''}
        cursorPosition={-1}
        dropTarget={dropTarget}
      />
    );

    expect(component.text()).toBe('author');

    expect(component.find('div.prop-type').hasClass('prop-type')).toBeTruthy();

    const style = component.find('div').get(0).props.children.props.style;
    expect(style.background).toBe('#50E3C2');
    expect(style.color).toBe('#222');

    component.find('div.prop-type').simulate('click');
    expect(updateShowPropDetailsMap).toHaveBeenCalledTimes(1);
  });

  it('renders with the details shown', () => {
    component = shallow(
      <Property
        updateProperty={updateProperty}
        name={'author'}
        value={{ value: '', type: 'variable' }}
        updateNodeType={updateNodeType}
        variableData={{}}
        updateShowPropDetailsMap={updateShowPropDetailsMap}
        showDetails={true}
        activePropName={''}
        cursorPosition={-1}
        dropTarget={dropTarget}
      />
    );

    // div part of property
    const div = component.find('div.prop-type').props();
    const style = div.style;
    expect(style.background).toBe('#50E3C2');
    expect(style.color).toBe('#222');
    expect(div.children).toBe('variable');

    // input part of property
    const input = component.find('input').props();
    expect(input.type).toBe('text');
    expect(input.value).toBe('');
    expect(input.autoFocus).toBe(false);
  });

  it('autofocuses the input', () => {
    component = shallow(
      <Property
        updateProperty={updateProperty}
        name={'author'}
        value={{ value: 'a', type: 'variable' }}
        updateNodeType={updateNodeType}
        variableData={{}}
        updateShowPropDetailsMap={updateShowPropDetailsMap}
        showDetails={true}
        activePropName={'author'}
        cursorPosition={1}
        dropTarget={dropTarget}
      />
    );

    // div part of property
    const div = component.find('div.prop-type').props();
    const style = div.style;
    expect(style.background).toBe('#50E3C2');
    expect(style.color).toBe('#222');
    expect(div.children).toBe('variable');

    // input part of property
    const input = component.find('input').props();
    expect(input.type).toBe('text');
    expect(input.value).toBe('a');
    expect(input.autoFocus).toBe(true);
  });

  it('triggers the right function calls', () => {
    component = shallow(
      <Property
        updateProperty={updateProperty}
        name={'author'}
        value={{ value: 'a', type: 'variable' }}
        updateNodeType={updateNodeType}
        variableData={{}}
        updateShowPropDetailsMap={updateShowPropDetailsMap}
        showDetails={true}
        activePropName={'author'}
        cursorPosition={1}
        dropTarget={dropTarget}
      />
    );

    // input part of property
    const input = component.find('input');
    expect(input.props().type).toBe('text');
    expect(input.props().value).toBe('a');
    expect(input.props().autoFocus).toBe(true);

    expect(updateProperty).toHaveBeenCalledTimes(0);
    input.simulate('change', { target: { value: 'abc' } });
    expect(updateProperty).toHaveBeenCalledTimes(1);
    expect(updateProperty.mock.results[0].value).toEqual(['author', 'abc']);
  });
});

describe('<PropertyList />', () => {
  let component;
  let updateNodeWithNewProperties;
  let updateNodeType;
  let updateShowPropDetailsMap;
  let variableData = {};
  let showPropDetailsMap = { author: false, link: true };

  beforeEach(() => {
    updateNodeWithNewProperties = jest.fn();
    updateNodeType = jest.fn();
    updateShowPropDetailsMap = jest.fn();
  });

  it('should render two Properties', () => {
    component = shallow(
      <PropertyList
        node={{ properties: { author: 'my-cat-deirdre', link: 'link' } }}
        updateNodeWithNewProperties={updateNodeWithNewProperties}
        updateNodeType={updateNodeType}
        updateShowPropDetailsMap={updateShowPropDetailsMap}
        variableData={variableData}
        showPropDetailsMap={showPropDetailsMap}
        activePropName='link'
        cursorPosition={-1}
      />
    );

    const div = component.find('div').get(0);

    // 2 props (author and link)
    expect(div.props.children).toHaveLength(2);
    expect(div.props.children[0].key).toBe('author');
    expect(div.props.children[1].key).toBe('link');
  });
});
