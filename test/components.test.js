import * as React from 'react';
import { mount } from 'enzyme';
import { Property } from '../src/render/idyll-display/components/property';
import expect from 'expect';

describe('<Property />', () => {
  let component;

  beforeAll(() => {
    component = mount(<Property />);
  });

  it('prelim snapshot test', () => {
    expect(component.html()).toMatchSnapshot();
  });
});
