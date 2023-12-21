// import { HtmlHTMLAttributes, useState } from 'react'
import './App.css'

import {
    initializeSubject, subjectCodeList,
} from './subject';
import SyllabusTable from './subject/SyllabusTable';
import { numberOfSubjectsToShow } from './subject/SyllabusTable';


// TODO 担当教員が極端に多いケースがあるので、その場合は適当な上限を作って「...」としておく
// TODO そもそも1行で表示するのが適切でないものもある。複数行表示するようにして、ウィンドウの横幅がある程度あるときには横スクロールなしで一覧できるようにする

function App() {
    console.log("App")
    initializeSubject();
    // updateTable();
    return (
        <div>
            <h1>シラバス momiji2</h1>
            <p>開発中です。</p>
            <p>今後の実装予定：
                <ul>
                    <li>検索機能</li>
                    <li>表をきれいに表示する</li>
                    <li>マウスホバーで授業詳細を見ることができるようにする</li>
                    <li>教員のresearchmapのリンク</li>
                    <li>時間割の仮組み機能</li>
                    <li>スマホ対応</li>
                    <li></li>
                </ul></p>
            <p>github: swawa-yu</p>
            <p>twitter: @swawa_yu, @archaic_hohoemi</p>
            <p>参考：KdBっぽいなにか</p>
            <br></br>
            <p>検索条件：なし</p>

            {/* 本来は下のような処理は別の部分に任せるべき */}
            <p>{subjectCodeList.length}個の授業がヒットしました。(うち{numberOfSubjectsToShow}件を表示しています。)</p>
            <SyllabusTable></SyllabusTable>
        </div>
    )
}

export default App

