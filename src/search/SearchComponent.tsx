import React, { useState } from 'react';
import { SearchOptions, BookmarkFilter } from '.';
import KomaSelector, { initializeYoubiKoma, YoubiKomaSelected } from './KomaSelector';
import './SearchComponent.css';
import { kamokuKubuns, kaikouBukyokus } from '../subject/types';

type SearchComponentProps = {
    onSearch: (newSearchOptions: SearchOptions) => void;
    bookmarkedSubjects: Set<string>;
};

// TODO: あいまい検索に対応(generalSearch)
const SearchComponent: React.FC<SearchComponentProps> = ({ onSearch, bookmarkedSubjects }: SearchComponentProps) => {
    const initialSearchOptions: SearchOptions = {
        campus: "指定なし",
        bookmarkFilter: 'all',
        teacher: '',
        subjectName: '',
        kamokuKubun: '',
        kaikouBukyoku: '',
        youbiKoma: initializeYoubiKoma(true),
        bookmarkedSubjects: bookmarkedSubjects,
        semester: "指定なし",
        jikiKubun: "指定なし",
        courseType: "指定なし",
    };
    const [searchOptions, setSearchOptions] = useState<SearchOptions>(initialSearchOptions);

    const handleSearch = () => {
        onSearch(searchOptions);
    };

    const handleClear = () => {
        setSearchOptions(initialSearchOptions);
    };

    const handleYoubiKomaChange = (newYoubiKoma: YoubiKomaSelected) => {
        setSearchOptions({ ...searchOptions, youbiKoma: newYoubiKoma });
    };

    return (
        <>
            <h2>検索条件</h2>
            <div className='search-component'>
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
                <label htmlFor="semester-select">セメスター:</label>
                <select
                    id="semester-select"
                    value={searchOptions.semester}
                    onChange={(e) => setSearchOptions({ ...searchOptions, semester: e.target.value as SearchOptions['semester'] })}
                >
                    <option value="指定なし">指定なし</option>
                    <option value="前期">前期</option>
                    <option value="後期">後期</option>
                    {/* <option value="解析エラー">解析エラー</option> */}
                </select>

                {/* TODO: 時期区分はチェックボックスにしたい */}
                <label htmlFor="jiki-kubun-select">時期区分:</label>
                <select
                    id="jiki-kubun-select"
                    value={searchOptions.jikiKubun}
                    onChange={(e) => setSearchOptions({ ...searchOptions, jikiKubun: e.target.value as SearchOptions['jikiKubun'] })}
                >
                    {/* export const jikiKubuns = ['１ターム', '２ターム', '３ターム', '４ターム', 'セメスター（前期）', 'セメスター（後期）', 'ターム外（前期）', 'ターム外（後期）', '年度', '通年', '集中'] as const */}
                    <option value="指定なし">指定なし</option>
                    <option value="１ターム">１ターム</option>
                    <option value="２ターム">２ターム</option>
                    <option value="３ターム">３ターム</option>
                    <option value="４ターム">４ターム</option>
                    <option value="セメスター（前期）">セメスター（前期）</option>
                    <option value="セメスター（後期）">セメスター（後期）</option>
                    <option value="ターム外（前期）">ターム外（前期）</option>
                    <option value="ターム外（後期）">ターム外（後期）</option>
                    <option value="年度">年度</option>
                    <option value="通年">通年</option>
                    <option value="集中">集中</option>
                    {/* <option value="解析エラー">解析エラー</option> */}
                </select>
                {/* 科目区分のドロップダウンメニュー */}
                <label htmlFor="kamoku-kubun-select">科目区分:</label>
                <select
                    id="kamoku-kubun-select"
                    value={searchOptions.kamokuKubun}
                    onChange={(e) => setSearchOptions({ ...searchOptions, kamokuKubun: e.target.value })}
                >
                    <option value="">指定なし</option>
                    {kamokuKubuns.map((kamokuKubun, index) => (
                        <option key={index} value={kamokuKubun}>{kamokuKubun}</option>
                    ))}
                </select>

                <label htmlFor="course-type-select">学部／大学院:</label>
                <select
                    id="course-type-select"
                    value={searchOptions.courseType}
                    onChange={(e) => setSearchOptions({ ...searchOptions, courseType: e.target.value as SearchOptions['courseType'] })}
                >
                    <option value="指定なし">指定なし</option>
                    <option value="学部">学部</option>
                    <option value="大学院">大学院</option>
                </select>

                {/* 開講部局のドロップダウンメニュー */}
                <label htmlFor="kaikou-bukyoku-select">開講部局:</label>
                <select
                    id="kaikou-bukyoku-select"
                    value={searchOptions.kaikouBukyoku}
                    onChange={(e) => setSearchOptions({ ...searchOptions, kaikouBukyoku: e.target.value })}
                >
                    <option value="">指定なし</option>
                    {kaikouBukyokus.map((kaikouBukyoku, index) => (
                        <option key={index} value={kaikouBukyoku}>{kaikouBukyoku}</option>
                    ))}
                </select>

                <KomaSelector onScheduleChange={handleYoubiKomaChange} />

                <label htmlFor="subject-name">授業科目名(部分一致): </label>
                <input
                    id="subject-name"
                    type="text"
                    value={searchOptions.subjectName}
                    onChange={(e) => setSearchOptions({ ...searchOptions, subjectName: e.target.value })}
                    placeholder="授業科目名"
                />
                <br></br>

                <label htmlFor="teacher-name">担当教員名(部分一致): </label>
                <input
                    id='teacher-name'
                    type="text"
                    value={searchOptions.teacher}
                    onChange={(e) => setSearchOptions({ ...searchOptions, teacher: e.target.value })}
                    placeholder="担当教員名"
                />

                <br></br>
                <br></br>

                <label htmlFor="bookmark-filter">ブックマーク:</label>
                <select
                    id="bookmark-filter"
                    value={searchOptions.bookmarkFilter}
                    onChange={(e) => setSearchOptions({ ...searchOptions, bookmarkFilter: e.target.value as BookmarkFilter })}
                >
                    <option value="all">指定なし</option>
                    <option value="bookmark">ブックマークのみを表示</option>
                    <option value="except-bookmark">ブックマークを除外</option>
                </select>
                <br></br>
                <br></br>
                <button onClick={handleSearch}>検索</button>
                <button onClick={handleClear}>検索条件をクリア</button>
            </div >
        </>
    );
};

export default SearchComponent;
