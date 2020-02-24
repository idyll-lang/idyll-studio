import * as React from 'react';
import { mount } from 'enzyme';
import { Property } from '../src/render/idyll-display/components/property';
import expect from 'expect';

describe('<Property /> with props', () => {
  let component;
  let value = '';
  let nextType = '';
  let updateProperty = jest.fn((propertyName, value, e) => {
    value = value;
  });

  let updateNodeType = jest.fn((name, nextType) => {
    nextType = nextType;
  });

  let updateShowPropDetailsMap = jest.fn();

  beforeAll(() => {
    value = '';
    nextType = '';

    component = mount(
      <Property
        updateProperty={updateProperty}
        name={'author'}
        value={{ value: value }}
        updateNodeType={updateNodeType}
        variableData={{}}
        updateShowPropDetailsMap={updateShowPropDetailsMap}
        showDetails={false}
        activePropName={''}
        cursorPosition={-1}
      />
    );
  });

  it('prelim snapshot test', () => {});
});
