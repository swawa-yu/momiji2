import { useState, useEffect } from 'react';
import './App.css';

import {
    initializeSubject,
} from './subject';
import SearchComponent from './search/SearchComponent';
import { SearchOptions } from './search';
import { initializeYoubiKoma } from './search/KomaSelector';
import TableView from './table-view/TableView';
import { BookmarkProvider } from './contexts/BookmarkContext';
import ExportBookmarkButton from './ExportBookmarkButton';
import Timetable from './timetable/Timetable';

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
        semester: '指定なし',
        jikiKubun: '指定なし',
        courseType: '指定なし',
        language: '指定なし',
        rishuNenji: "指定なし",
        rishuNenjiFilter: "以下"
    });

    const handleSearch = (newSearchOptions: SearchOptions) => {
        setSearchOptions({
            ...newSearchOptions,
        });
    };

    const [bookmarkedSubjects, setBookmarkedSubjects] = useState<Set<string>>(new Set());

    // ブックマークの追加・削除を行う関数
    const handleBookmarkToggle = (lectureCode: string) => {
        console.log("handleBookmarkToggle")
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
        console.log(bookmarkedSubjects)
    };

    // テーマのステートを追加 (デフォルトはシステムの設定に依存)
    const [theme, setTheme] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    // テーマ切り替え用の関数
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // テーマが変更されたら、body要素に適切なクラスを動的に割り当てる
    useEffect(() => {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
    }, [theme]);

    return (
        <>
            <BookmarkProvider>
                <ExportBookmarkButton></ExportBookmarkButton>
                <div className="theme-switcher">
                    <label>
                        <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
                        ダークモード
                    </label>
                </div>

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

                <SearchComponent onSearch={handleSearch} bookmarkedSubjects={bookmarkedSubjects}></SearchComponent>

                <TableView searchOptions={searchOptions} bookmarkedSubjects={bookmarkedSubjects} handleBookmarkToggle={handleBookmarkToggle}></TableView>

                <Timetable></Timetable>

            </BookmarkProvider>
        </>
    );
}

export default App;
