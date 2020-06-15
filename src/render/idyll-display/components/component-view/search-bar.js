import * as React from 'react';
import { SearchIcon } from './icons/search-icon';

export const SearchBarInput = (props) => {
  const { onChange, value, placeholder } = props;

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
      <SearchIcon
        style={{
          position: 'absolute',
          bottom: '30px',
          transform: 'scale(1.5)',
        }}
      />
      <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        className="search-input"
      />
    </div>
  );
};
