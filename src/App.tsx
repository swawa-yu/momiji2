import { useState } from 'react';
// import { HtmlHTMLAttributes, useState } from 'react'
import './App.css'

import {
    // initializeSubject, subjectCodeList,
    initializeSubject,
} from './subject';
import SyllabusTable from './table-view/SyllabusTable';
import SyllabusTableRaw from './table-view/SyllabusTableRaw';
// import { numberOfSubjectsToShow } from './subject/SyllabusTable';


// TODO 担当教員が極端に多いケースがあるので、その場合は適当な上限を作って「...」としておく
// TODO そもそも1行で表示するのが適切でないものもある。複数行表示するようにして、ウィンドウの横幅がある程度あるときには横スクロールなしで一覧できるようにする

function App() {
    console.log("App")
    initializeSubject();
    // updateTable();

    const [isTableRaw, setIsTableRaw] = useState(true);

    return (
        <>
            <h1>シラバス momiji2</h1>
            <p>開発中です。</p>
            <p>github: swawa-yu</p>
            <p>twitter: @swawa_yu, @archaic_hohoemi</p>
            <p>参考：KdBっぽいなにか</p>
            <br></br>

            <button onClick={() => setIsTableRaw(!isTableRaw)}>
                {isTableRaw ? "見やすい表に切り替える" : "基本データ表に切り替える"}
            </button>
            {isTableRaw ? <SyllabusTableRaw></SyllabusTableRaw> : <SyllabusTable></SyllabusTable>}
        </>
    )
}

export default App

