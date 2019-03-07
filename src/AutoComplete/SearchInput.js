import React from 'react';

const SearchInput = ({ name, label, value, onChange, onKeyDown }) => (
    <>
        <input
            autoComplete="off"
            spellCheck="false"
            required
            type="text"
            id="search"
            name={name}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
        />
        <label htmlFor="search">{label}</label>
    </>
);

export default SearchInput;
