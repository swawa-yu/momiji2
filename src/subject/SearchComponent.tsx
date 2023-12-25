import React, { useState } from 'react';

type SearchComponentProps = {
    onSearch: (term: string, checkbox: boolean) => void;
};

const SearchComponent: React.FC<SearchComponentProps> = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [checkboxValue, setCheckboxValue] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCheckboxValue(e.target.checked);
    };

    const handleSearch = () => {
        onSearch(searchTerm, checkboxValue);
    };

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="検索..."
            />
            <input
                type="checkbox"
                checked={checkboxValue}
                onChange={handleCheckboxChange}
            />
            <button onClick={handleSearch}>検索</button>
        </div>
    );
};

export default SearchComponent;
