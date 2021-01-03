import React from 'react';
import Context from './context';

/**
 * Returns a component that is passed the context as a prop
 * to be its consumer.
 * @param {React.PureComponent} WrappedConsumer a component that will consume
 *                                              the context
 */
export const withContext = WrappedConsumer => props => (
  <Context.Consumer>
    {context => <WrappedConsumer {...props} context={context} />}
  </Context.Consumer>
);
