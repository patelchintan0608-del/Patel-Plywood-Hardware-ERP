import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = "Search records...", width = "300px" }) => {
  return (
    <div className="search-bar" style={{ width }}>
      <Search className="search-icon" size={16} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;
