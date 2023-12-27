import { useState } from 'react';
// import { HtmlHTMLAttributes, useState } from 'react'
import './App.css'

import {
    initializeSubject,
} from './subject';
import SyllabusTable from './table-view/SyllabusTable';
import SyllabusTableRaw from './table-view/SyllabusTableRaw';
import SearchComponent from './search/SearchComponent';
import { SearchOptions } from './search';
import { initializeYoubiKoma } from './search/KomaSelector';

function App() {
    initializeSubject();

    const [searchOptions, setSearchOptions] = useState<SearchOptions>({
        campus: '指定なし',
        bookmarkFilter: 'all',
        teacher: '',
        subjectName: '',
        youbi: '',
        koma: '',
        kamokuKubun: '',
        kaikouBukyoku: '',
        youbiKoma: initializeYoubiKoma(true),
    });
    const [isTableRaw, setIsTableRaw] = useState(true);

    const handleSearch = (newSearchOptions: SearchOptions) => {
        setSearchOptions(newSearchOptions);
    };


    return (
        <>
            <div>
                <h1>シラバス momiji2</h1>
                <p>開発中です。</p>
                <p>コマの指定による検索は不完全で、解析エラーがある科目はうまく検索できません。</p>
                <p>github: swawa-yu</p>
                <p>twitter: @swawa_yu, @archaic_hohoemi</p>
                <p>参考：KdBっぽいなにか</p>
            </div>

            <br></br>

            <SearchComponent onSearch={handleSearch}></SearchComponent>

            <br></br>

            <div>
                <button onClick={() => setIsTableRaw(!isTableRaw)}>
                    {isTableRaw ? "見やすい表に切り替える" : "基本データ表に切り替える"}
                </button>
                {isTableRaw ?
                    <SyllabusTableRaw searchOptions={searchOptions}></SyllabusTableRaw> :
                    <SyllabusTable searchOptions={searchOptions}></SyllabusTable>}
            </div>
        </>
    )
}

export default App

