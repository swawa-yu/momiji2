import React, { useState } from 'react';
import { SearchOptions } from '.';
import KomaSelector, { initializeYoubiKoma, YoubiKomaSelected } from './KomaSelector';

type KomaSelectorProps = {
    onSearch: (SearchOptions: SearchOptions) => void;
};

// TODO: あいまい検索に対応(generalSearch)
// TODO: コマの指定を5x5のチェックボックス(行: 1~5コマ, 列: 月~金曜日)と、集中、その他にする。また、全てを選択／解除するボタンをつける。（デフォルトでは全選択状態）
const SearchComponent: React.FC<KomaSelectorProps> = ({ onSearch }: KomaSelectorProps) => {
    const [searchOptions, setSearchOptions] = useState<SearchOptions>({
        campus: "指定なし",
        bookmarkFilter: 'all',
        teacher: '',
        subjectName: '',
        youbi: '',
        koma: '',
        kamokuKubun: '',
        kaikouBukyoku: '',
        youbiKoma: initializeYoubiKoma(true),
    });

    const handleSearch = () => {
        onSearch(searchOptions);
    };

    const handleYoubiKomaChange = (newYoubiKoma: YoubiKomaSelected) => {
        setSearchOptions({ ...searchOptions, youbiKoma: newYoubiKoma });
    };

    return (
        <>
            <div>
                <label htmlFor="campus-select">キャンパス:</label>
                <select
                    id="campus-select"
                    value={searchOptions.campus}
                    onChange={(e) => setSearchOptions({ ...searchOptions, campus: e.target.value as SearchOptions['campus'] })}
                >
                    <option value="指定なし">指定なし</option>
                    <option value="東広島">東広島</option>
                    <option value="霞">霞</option>
                    <option value="東千田">東千田</option>
                    <option value="その他">その他</option>
                </select>
                {/* <input
                    type="text"
                    value={searchOptions.campus}
                    onChange={(e) => setSearchOptions({ ...searchOptions, campus: e.target.value })}
                    placeholder="キャンパス"
                /> */}
                <input
                    type="text"
                    value={searchOptions.subjectName}
                    onChange={(e) => setSearchOptions({ ...searchOptions, subjectName: e.target.value })}
                    placeholder="授業科目名"
                /><input
                    type="text"
                    value={searchOptions.kamokuKubun}
                    onChange={(e) => setSearchOptions({ ...searchOptions, kamokuKubun: e.target.value })}
                    placeholder="科目区分"
                />
                <input
                    type="text"
                    value={searchOptions.kaikouBukyoku}
                    onChange={(e) => setSearchOptions({ ...searchOptions, kaikouBukyoku: e.target.value })}
                    placeholder="開講部局"
                />
                <input
                    type="text"
                    value={searchOptions.teacher}
                    onChange={(e) => setSearchOptions({ ...searchOptions, teacher: e.target.value })}
                    placeholder="担当教員名"
                />
                <input
                    type="text"
                    value={searchOptions.youbi}
                    onChange={(e) => setSearchOptions({ ...searchOptions, youbi: e.target.value })}
                    placeholder="曜日"
                />
                <input
                    type="text"
                    value={searchOptions.koma}
                    onChange={(e) => setSearchOptions({ ...searchOptions, koma: e.target.value })}
                    placeholder="コマ"
                />
                <input
                    type="checkbox"
                    checked={searchOptions.bookmarkFilter === 'bookmark'}
                    onChange={(e) => setSearchOptions({ ...searchOptions, bookmarkFilter: e.target.checked ? 'bookmark' : 'all' })}
                />
                <br></br>
                <br></br>
                <br></br>
                <KomaSelector onScheduleChange={handleYoubiKomaChange} />
                <br></br>
                <br></br>
                <br></br>
                <button onClick={handleSearch}>検索</button>
            </div>
        </>
    );
};

export default SearchComponent;
