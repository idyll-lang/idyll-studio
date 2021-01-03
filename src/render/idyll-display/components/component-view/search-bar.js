import * as React from 'react';
import { SearchIcon } from './icons/search-icon';
import { XIcon } from './icons/x-icon';

export const SearchBarInput = props => {
  const { onChange, value, placeholder, onClick } = props;

  return (
    <div className="component-search-bar-container">
      <SearchIcon className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        className="search-input"
      />
      {value && value.length > 0 ? (
        <button className="search-cancel-button" onClick={onClick}>
          <XIcon />
        </button>
      ) : (
        <></>
      )}
    </div>
  );
};
