import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { Property } from '../src/render/idyll-display/components/property';
import expect from 'expect';
import PropertyList from '../src/render/idyll-display/components/property-list';
import EditableCodeCell from '../src/render/idyll-display/components/code-cell';
import { SearchBarInput } from '../src/render/idyll-display/components/component-view/search-bar';
import ComponentAccordion from '../src/render/idyll-display/components/component-view/component-accordion';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Arrow } from '../src/render/idyll-display/components/component-view/icons/arrow';
import Component from '../src/render/idyll-display/components/component-view/component';
import WrappedComponentView from '../src/render/idyll-display/components/component-view/component-view';
import Context from '../src/render/context/context';

describe('<Property /> with props', () => {
  let component;
  let updateProperty;

  let updateNodeType;
  let updateShowPropDetailsMap;

  const dropTarget = jest.fn((jsxElement) => jsxElement);

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
        activePropName="link"
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

describe('<EditableCodeCell />', () => {
  let component;
  let onExecute;
  let onBlur;

  beforeEach(() => {
    onExecute = jest.fn();
    onBlur = jest.fn();
  });

  it('should display the markup and run onBlur', () => {
    const markup = '[Testing one:`2 + 3` /]';
    component = mount(
      <EditableCodeCell markup={markup} onExecute={onExecute} onBlur={onBlur} />
    );

    const code = component.find('code');
    const text = code.text();
    expect(text).toBe(markup);

    const div = component.find('div');
    div.simulate('click');
    expect(onBlur).toHaveBeenCalledTimes(0);
    div.simulate('blur');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('should display markup and execute on shift + enter', () => {
    const markup = '[Testing one:`2 + 3` /]';
    component = mount(
      <EditableCodeCell markup={markup} onExecute={onExecute} onBlur={onBlur} />
    );

    const code = component.find('code');
    const text = code.text();
    expect(text).toBe(markup);

    const div = component.find('div');
    div.simulate('click');
    expect(onBlur).toHaveBeenCalledTimes(0);

    expect(onExecute).toHaveBeenCalledTimes(0);
    div.simulate('keyDown', { key: 'Enter', keyCode: 13, shiftKey: true });
    expect(onExecute).toHaveBeenCalledTimes(1);

    div.simulate('blur');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('should display markup and toggle content editable', () => {
    const markup = '[Testing one:`2 + 3` /]';
    component = mount(
      <EditableCodeCell markup={markup} onExecute={onExecute} onBlur={onBlur} />
    );

    const code = component.find('code');
    const text = code.text();
    expect(text).toBe(markup);

    let div = component.find('div');

    expect(div.props().contentEditable).toBeFalsy();
    const pre = component.find('pre');
    pre.simulate('click');

    div = component.find('div');
    expect(div.props().contentEditable).toBeTruthy();
  });
});

describe('<SearchBarInput />', () => {
  let onChange;
  let onClick;
  let component;

  beforeEach(() => {
    onChange = jest.fn();
    onClick = jest.fn();
  });

  it('should render a search bar with the given values', () => {
    component = mount(
      <SearchBarInput
        onChange={onChange}
        value="Input"
        placeholder="Dummy Value"
        onClick={onClick}
      />
    );

    const input = component.find('input');
    expect(input.props().placeholder).toBe('Dummy Value');
    expect(input.props().value).toBe('Input');

    expect(onChange).toHaveBeenCalledTimes(0);
    expect(onClick).toHaveBeenCalledTimes(0);

    expect(component.exists('button')).toBeTruthy();
  });

  it('should render a search bar and trigger onChange and onClick values', () => {
    component = mount(
      <SearchBarInput
        onChange={onChange}
        value="Input"
        placeholder="Dummy Value"
        onClick={onClick}
      />
    );

    const input = component.find('input');
    expect(input.props().placeholder).toBe('Dummy Value');
    expect(input.props().value).toBe('Input');

    expect(onChange).toHaveBeenCalledTimes(0);

    input.simulate('change', { key: 'a' });
    expect(onChange).toHaveBeenCalledTimes(1);

    const button = component.find('button');
    expect(onClick).toHaveBeenCalledTimes(0);
    button.simulate('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render a search bar with no X button', () => {
    component = mount(
      <SearchBarInput
        onChange={onChange}
        value=""
        placeholder="Dummy Value"
        onClick={onClick}
      />
    );

    const input = component.find('input');
    expect(input.props().placeholder).toBe('Dummy Value');
    expect(input.props().value).toBe('');

    expect(component.exists('button')).toBeFalsy();
  });
});

describe('<ComponentAccordion />', () => {
  let component;
  let components = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];

  it('should render an accordion with the given category and components', () => {
    component = mount(
      <DndProvider backend={HTML5Backend}>
        <ComponentAccordion category="Category" components={components} />
      </DndProvider>
    );

    const header = component.find('h3');
    expect(header.text()).toBe('Category');

    expect(component.find(Arrow).props().isClosed).toBeTruthy();

    // simulate opening the accordion
    const button = component.find('button');
    button.simulate('click');
    expect(component.find(Arrow).props().isClosed).toBeFalsy();

    const componentContents = component.find('div.component');
    expect(componentContents).toHaveLength(3);
    expect(componentContents.at(0).text()).toBe('A');
    expect(componentContents.at(1).text()).toBe('B');
    expect(componentContents.at(2).text()).toBe('C');
  });
});

describe('<Component />', () => {
  let component;

  it('should render the component name', () => {
    component = mount(
      <DndProvider backend={HTML5Backend}>
        <Component component={{ name: 'abc' }} searchValue="" />
      </DndProvider>
    );

    const componentName = component.find('div.component');
    expect(componentName.text()).toBe('Abc');
  });

  it('should render the component name with the stylings', () => {
    component = mount(
      <DndProvider backend={HTML5Backend}>
        <Component component={{ name: 'abc' }} searchValue="a" />
      </DndProvider>
    );

    const componentBold = component.find('strong');
    expect(componentBold.text()).toBe('A');

    const componentName = component.find('div.component');
    expect(componentName.text()).toBe('Abc');
  });
});

describe('<ComonentView />', () => {
  it('should render the ComponentView with a search bar and accordion', () => {
    const component = mount(
      <DndProvider backend={HTML5Backend}>
        <WrappedComponentView
          context={{
            components: [{ name: 'abc' }, { name: 'bcd' }, { name: 'cde' }],
          }}
        />
      </DndProvider>
    );

    expect(component.exists(SearchBarInput)).toBeTruthy();
    expect(component.exists(ComponentAccordion)).toBeTruthy();
    expect(component.exists('div#filtered-search-results')).toBeFalsy();
  });
});
