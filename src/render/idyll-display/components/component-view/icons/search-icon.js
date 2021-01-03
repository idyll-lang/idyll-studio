import * as React from 'react';

export const SearchIcon = props => {
  const { ...rest } = props;

  return (
    <svg
      width="8px"
      height="8px"
      viewBox="0 0 8 8"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xlink="http://www.w3.org/1999/xlink"
      {...rest}>
      <title>Group 2</title>
      <g
        id="Page-1"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        fillOpacity="0">
        <g id="Group-2" fill="#D8D8D8" stroke="#131313">
          <circle id="Oval" cx="3" cy="3" r="2.5" />
          <line
            x1="5"
            y1="5"
            x2="7"
            y2="7"
            id="Line-2"
            strokeLinecap="square"
          />
        </g>
      </g>
    </svg>
  );
};
