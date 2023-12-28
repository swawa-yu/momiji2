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
        kamokuKubun: '',
        kaikouBukyoku: '',
        youbiKoma: initializeYoubiKoma(true),
        bookmarkedSubjects: new Set()
    });
    const [isTableRaw, setIsTableRaw] = useState(true);

    const handleSearch = (newSearchOptions: SearchOptions) => {
        setSearchOptions({
            ...newSearchOptions,
            bookmarkedSubjects: bookmarkedSubjects // 現在のブックマーク状態を保持
        });

    };

    const [bookmarkedSubjects, setBookmarkedSubjects] = useState<Set<string>>(new Set());

    // ブックマークの追加・削除を行う関数
    const handleBookmarkToggle = (lectureCode: string) => {
        setBookmarkedSubjects(prev => {
            const newBookmarks = new Set(prev);
            if (newBookmarks.has(lectureCode)) {
                newBookmarks.delete(lectureCode);
            } else {
                newBookmarks.add(lectureCode);
            }
            setSearchOptions(prevOptions => ({
                ...prevOptions,
                bookmarkedSubjects: newBookmarks
            }));
            return newBookmarks;
        });
    };


    return (
        <>
            <div>
                <h1>シラバス momiji2</h1>
                <h2>注意事項</h2>
                <li>開発中です。</li>
                <li>コマの指定による検索は不完全で、解析エラーがある科目はうまく検索できません。</li>
                <h2>開発者 (連絡先(バグ報告等))</h2>
                <li>GitHub: <a href='https://github.com/swawa-yu'>swawa-yu</a> (リポジトリ：<a href='https://github.com/swawa-yu/momiji2'>swawa-yu/momiji2</a>)</li>
                <li>Twitter: <a href='https://twitter.com/swawa_yu'>@swawa_yu</a>, <a href='https://twitter.com/archaic_hohoemi'>@archaic_hohoemi</a></li>
                <h2>参考</h2>
                →<a href='https://make-it-tsukuba.github.io/alternative-tsukuba-kdb/'>KdBっぽいなにか</a> (<a href='https://github.com/Make-IT-TSUKUBA/alternative-tsukuba-kdb'>リポジトリ</a>)
            </div>

            <br></br>

            <SearchComponent onSearch={handleSearch} bookmarkedSubjects={bookmarkedSubjects}></SearchComponent>

            <br></br>

            <div>
                <button onClick={() => setIsTableRaw(!isTableRaw)}>
                    {isTableRaw ? "見やすい表に切り替える" : "基本データ表に切り替える"}
                </button>
                {isTableRaw ?
                    <SyllabusTableRaw searchOptions={searchOptions}></SyllabusTableRaw> :
                    <SyllabusTable searchOptions={searchOptions} bookmarkedSubjects={bookmarkedSubjects} handleBookmarkToggle={handleBookmarkToggle}></SyllabusTable>}
            </div>
        </>
    )
}

export default App

