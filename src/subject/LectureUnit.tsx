// LectureUnit.tsx
import React from 'react';
// import {
//     subjectCodeList,
//     subjectMap,
// } from './';

import './LectureUnit.css'


type LectureUnitProps = {
    // 必要なプロパティを定義
    subjectData: any; // 適切な型に変更してください
};






const LectureUnit: React.FC<LectureUnitProps> = ({ subjectData }) => {
    return (
        <div className="lecture-details">
            <div className="star-button">★</div>
            <div className="lecture-code-name">
                <div className="lecture-code">講義コード</div>
                <div className="lecture-name">授業科目名</div>
            </div>
            <div className="instructor">担当教員名</div>
            <div className="lecture-details-columns">
                <div>開設期</div>
                <div>開講キャンパス</div>
                <div>対象学生</div>
                <div>使用言語</div>
            </div>
            <div className="lecture-details-info">
                <div>授業の目標・概要等</div>
                <div>予習・復習へのアドバイス</div>
                <div>履修上の注意 受講条件等</div>
                <div>メッセージ</div>
                <div>その他</div>
            </div>
        </div>
    );


    return (
        <div className="lecture-unit">
            {/* ここに授業の情報を表示するコードを書きます */}
            <h3>{subjectData["授業科目名"]}</h3>
            <p>{subjectData["開講部局"]}</p>
            <p>{subjectData["科目区分"]}</p>
            {/* 他の必要な情報を追加 */}
        </div>
    );
};

export default LectureUnit;
