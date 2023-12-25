import React, { useState } from 'react';
import { SearchOptions } from '.';

type SearchComponentProps = {
    onSearch: (SearchOptions: SearchOptions) => void;
};


const SearchComponent: React.FC<SearchComponentProps> = ({ onSearch }: SearchComponentProps) => {
    const [localSearchOptions, setLocalSearchOptions] = useState<SearchOptions>({
        campus: '',
        bookmarkFilter: 'all',
    });

    const handleSearch = () => {
        onSearch(localSearchOptions);
    };

    return (
        <>
            <div>
                <input
                    type="text"
                    value={localSearchOptions.campus}
                    onChange={(e) => setLocalSearchOptions({ ...localSearchOptions, campus: e.target.value })}
                    placeholder="キャンパス"
                />
                <input
                    type="checkbox"
                    checked={localSearchOptions.bookmarkFilter === 'bookmark'}
                    onChange={(e) => setLocalSearchOptions({ ...localSearchOptions, bookmarkFilter: e.target.checked ? 'bookmark' : 'all' })}
                />
                <button onClick={handleSearch}>検索</button>
            </div>
            <div>検索条件: campus={localSearchOptions.campus}</div>
        </>
    );
};

export default SearchComponent;
