import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { Property } from '../src/render/idyll-display/components/component-editor/property';
import expect from 'expect';
import PropertyList from '../src/render/idyll-display/components/component-editor/property-list';
import EditableCodeCell from '../src/render/idyll-display/components/component-editor/code-cell';
import { SearchBarInput } from '../src/render/idyll-display/components/component-view/search-bar';
import ComponentAccordion from '../src/render/idyll-display/components/component-view/component-accordion';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Arrow } from '../src/render/idyll-display/components/component-view/icons/arrow';
import Component from '../src/render/idyll-display/components/component-view/component';
import WrappedComponentView from '../src/render/idyll-display/components/component-view/component-view';

describe('<Property /> with props', () => {
  let component;
  let updateProperty;

  let updateNodeType;

  const dropTarget = jest.fn((jsxElement) => jsxElement);

  beforeEach(() => {
    updateProperty = jest.fn((propertyName, value, e) => [propertyName, value]);

    updateNodeType = jest.fn((name, nextType) => [name, nextType]);
  });

  it('renders with property "value" input with initial value', () => {
    component = mount(
      <Property
        updateProperty={updateProperty}
        name={'author'}
        propertyObject={{type:'value', value:'Deirdre'}}
        updateNodeType={updateNodeType}
        variableData={{}}
        dropTarget={dropTarget}
      />
    );

    expect(component.find('div.prop-name').text()).toBe('author');

    const typeDiv = component.find('div.prop-type');
    expect(typeDiv.text()).toBe('string');
    expect(typeDiv.props().style.color).toBe('#4A90E2');

    const input = component.find('input').instance();
    expect(input.value).toBe('Deirdre');
  });

  it('should call props.updateProperty on input change', () => {
    component = mount(
      <Property
        updateProperty={updateProperty}
        name={'author'}
        propertyObject={{type:'variable', value:'state'}}
        updateNodeType={updateNodeType}
        variableData={{}}
        dropTarget={dropTarget}
      />
    );

    expect(component.find('div.prop-name').text()).toBe('author');

    const typeDiv = component.find('div.prop-type');
    expect(typeDiv.text()).toBe('variable');
    expect(typeDiv.props().style.color).toBe('#50E3C2');

    const input = component.find('input');
    expect(input.instance().value).toBe('state');

    expect(updateProperty).toHaveBeenCalledTimes(0);
    input.simulate('change', { target: { value: 'abc' } });
    expect(updateProperty).toHaveBeenCalledTimes(1);
  });

  it('should call props.updateNodeType', () => {
    component = mount(
      <Property
        updateProperty={updateProperty}
        name={'date'}
        propertyObject={{type:'expression', value:'new Date()'}}
        updateNodeType={updateNodeType}
        variableData={{}}
        dropTarget={dropTarget}
      />
    );

    expect(component.find('div.prop-name').text()).toBe('date');

    const typeDiv = component.find('div.prop-type');
    expect(typeDiv.text()).toBe('expression');
    expect(typeDiv.props().style.color).toBe('#B8E986');

    // on click
    expect(updateNodeType).toHaveBeenCalledTimes(0);
    typeDiv.simulate('click');
    expect(updateNodeType).toHaveBeenCalledTimes(1);

    const input = component.find('input');
    expect(input.instance().value).toBe('new Date()');
  })
});

describe('<PropertyList />', () => {
  let component;
  let updateNodeWithNewProperties;
  let updateNodeType;
  let variableData = {};

  beforeEach(() => {
    updateNodeWithNewProperties = jest.fn();
    updateNodeType = jest.fn();
  });

  it('should render two Properties', () => {
    component = shallow(
      <PropertyList
        node={{ properties: { author: 'my-cat-deirdre', link: 'link' } }}
        updateNodeWithNewProperties={updateNodeWithNewProperties}
        updateNodeType={updateNodeType}
        variableData={variableData}
      />
    );

    const div = component.find('div.property-list').get(0);

    // 2 props (author and link)
    expect(div.props.children).toHaveLength(2);
    expect(div.props.children[0].key).toBe('author"my-cat-deirdre"');
    expect(div.props.children[1].key).toBe('link"link"');
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
