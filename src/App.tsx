import { useState, useEffect } from 'react';
import './App.css';

import {
    initializeSubject,
} from './subject';
import SearchComponent from './search/SearchComponent';
import { SearchOptions } from './search';
import TableView from './tableView/TableView';
import { BookmarkProvider } from './contexts/BookmarkContext';
import ExportBookmarkButton from './ExportBookmarkButton';
import Timetable from './timetable/Timetable';
import { initialSearchOptions } from './search/';

function App() {
    initializeSubject();

    const [searchOptions, setSearchOptions] = useState<SearchOptions>(initialSearchOptions);

    const handleSearch = (newSearchOptions: SearchOptions) => {
        setSearchOptions({
            ...newSearchOptions,
        });
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
                        <li>PC推奨です。</li>
                        <li>検索漏れがあるかもしれません。</li>
                        <li>シラバス情報は2023年4月に取得したものです。(2024年1月21日現在)</li>
                    </ul>
                    <h2>使い方について</h2>
                    <ul>
                        <li>「☆」はブックマークボタンで、押すと右下の時間割表に授業が追加されます。（集中は除く）</li>
                        <li>講義コードのリンク（新しいタブで開きます）を踏むと、公式のシラバスに飛びます。</li>
                        <li>担当教員名のリンク（新しいタブで開きます）を踏むと、research mapに飛びます。</li>
                        <li>基本データ表の文章にカーソルを合わせると、省略されている部分も見ることができます</li>
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

                <SearchComponent onSearch={handleSearch} searchOptions={searchOptions} setSearchOptions={setSearchOptions}></SearchComponent>

                <TableView searchOptions={searchOptions}></TableView>

                <Timetable></Timetable>

            </BookmarkProvider>
        </>
    );
}

export default App;
