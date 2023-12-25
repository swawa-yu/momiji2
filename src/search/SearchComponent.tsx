import React, { useState } from 'react';
import { SearchOptions } from '.';

type SearchComponentProps = {
    onSearch: (SearchOptions: SearchOptions) => void;
};

// TODO: あいまい検索に対応(generalSearch)
const SearchComponent: React.FC<SearchComponentProps> = ({ onSearch }: SearchComponentProps) => {
    const [searchOptions, setSearchOptions] = useState<SearchOptions>({
        campus: '',
        bookmarkFilter: 'all',
        teacher: '',
        subjectName: '',
    });

    const handleSearch = () => {
        onSearch(searchOptions);
    };

    return (
        <>
            <div>
                <input
                    type="text"
                    value={searchOptions.campus}
                    onChange={(e) => setSearchOptions({ ...searchOptions, campus: e.target.value })}
                    placeholder="キャンパス"
                />
                <input
                    type="text"
                    value={searchOptions.subjectName}
                    onChange={(e) => setSearchOptions({ ...searchOptions, subjectName: e.target.value })}
                    placeholder="授業科目名"
                />
                <input
                    type="text"
                    value={searchOptions.teacher}
                    onChange={(e) => setSearchOptions({ ...searchOptions, teacher: e.target.value })}
                    placeholder="担当教員名"
                />
                <input
                    type="checkbox"
                    checked={searchOptions.bookmarkFilter === 'bookmark'}
                    onChange={(e) => setSearchOptions({ ...searchOptions, bookmarkFilter: e.target.checked ? 'bookmark' : 'all' })}
                />
                <button onClick={handleSearch}>検索</button>
            </div>
            <div>検索条件: campus={searchOptions.campus}</div>
        </>
    );
};

export default SearchComponent;
