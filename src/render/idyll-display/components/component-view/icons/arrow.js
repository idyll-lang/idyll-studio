import * as React from 'react';
import { ArrowRight } from './arrow-right';
import { ArrowDown } from './arrow-down';

/**
 * Displays an svg arrow
 * @param {{isClosed: boolean}} props
 */
export const Arrow = (props) => {
  const { isClosed } = props;

  return (
    <span style={{ marginRight: '10px' }}>
      {isClosed ? <ArrowRight /> : <ArrowDown />}
    </span>
  );
};
