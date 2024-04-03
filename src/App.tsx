import { useState, useEffect } from 'react';
import './App.css';

import {
    initializeSubject,
} from './subject';
import SearchComponent from './components/SearchComponent';
import ExportBookmarkButton from './components/ExportBookmarkButton';
import TableView from './components/TableView';
import Timetable from './components/Timetable';
import { SearchOptions } from './types/search';
import { initialSearchOptions } from './search/';
import { BookmarkProvider } from './contexts/BookmarkContext';

function App() {
    initializeSubject();

    const [searchOptions, setSearchOptions] = useState<SearchOptions>(initialSearchOptions);

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
                        <li><b><u>【重要】最新のシラバス情報はMyもみじから確認してください！！</u></b></li>
                        <li>【重要】検索漏れ等があるかもしれません。ご了承ください。</li>
                        <li>PC推奨です。(スマホ対応はそのうちやる予定です。)</li>
                        <li>シラバス情報は2024年4月3日に取得したものです。(2024年4月3日現在)</li>
                    </ul>
                    <h2>開発者 (連絡先...バグ報告等はこちらまで)</h2>
                    <ul>
                        <li>
                            <i className="fab fa-github"></i> GitHub: <a href='https://github.com/swawa-yu'>swawa-yu</a>
                            (リポジトリ：<a href='https://github.com/swawa-yu/momiji2'>swawa-yu/momiji2</a>)
                        </li>
                        {/* <li>Twitter: <a href='https://twitter.com/swawa_yu'>@swawa_yu</a>, <a href='https://twitter.com/archaic_hohoemi'>@archaic_hohoemi</a></li> */}
                    </ul>
                </div>

                <SearchComponent searchOptions={searchOptions} setSearchOptions={setSearchOptions}></SearchComponent>

                <TableView searchOptions={searchOptions}></TableView>

                <Timetable></Timetable>

            </BookmarkProvider>
        </>
    );
}

export default App;
