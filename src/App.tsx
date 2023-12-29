import { useState } from 'react';
import './App.css'

import {
    initializeSubject,
} from './subject';
import SearchComponent from './search/SearchComponent';
import { SearchOptions } from './search';
import { initializeYoubiKoma } from './search/KomaSelector';
import TableView from './table-view/TableView';

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
        bookmarkedSubjects: new Set(),
        semester: '指定なし',
        jikiKubun: '指定なし',
        courseType: '指定なし',
        language: '指定なし',
    });

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
                <h1>広島大学シラバス momiji2(非公式)</h1>
                <h2>注意事項</h2>
                <ul>
                    <li>開発中です。</li>
                    <li>検索漏れがあるかもしれません。</li>
                    <li>シラバス情報は2023年5月に取得したものです。(2023年12月29日現在)</li>
                </ul>
                <h2>開発者 (連絡先...バグ報告等はこちらまで)</h2>
                <ul>
                    <li>GitHub: <a href='https://github.com/swawa-yu'>swawa-yu</a> (リポジトリ：<a href='https://github.com/swawa-yu/momiji2'>swawa-yu/momiji2</a>)</li>
                    <li>Twitter: <a href='https://twitter.com/swawa_yu'>@swawa_yu</a>, <a href='https://twitter.com/archaic_hohoemi'>@archaic_hohoemi</a></li>
                </ul>
            </div>

            <br></br>

            <SearchComponent onSearch={handleSearch} bookmarkedSubjects={bookmarkedSubjects}></SearchComponent>

            <br></br>
            <TableView searchOptions={searchOptions} bookmarkedSubjects={bookmarkedSubjects} handleBookmarkToggle={handleBookmarkToggle}></TableView>
        </>
    )
}

export default App
