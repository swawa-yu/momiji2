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






const SubjectUnitComponent: React.FC<LectureUnitProps> = ({ subjectData }) => {
    return (
        <div className="lecture-details">
            <div className="star-button">★</div>
            <div className="lecture-code-name">
                <div className="lecture-code">{subjectData["講義コード"]}</div>
                <div className="lecture-name">{subjectData["授業科目名"]}</div> </div>
            <div className="instructor">{subjectData["担当教員名"]}</div>
            <div className="lecture-details-columns">
                <div>{subjectData["開設期"]}</div>
                <div>{subjectData["開講キャンパス"]}</div>
                <div>{subjectData["対象学生"]}</div>
                <div>{subjectData["使用言語"]}</div>
            </div>
            <div className="lecture-details-info">
                <div>{subjectData["授業の目標・概要等"]}</div>
                <div>{subjectData["メッセージ"]}</div>
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

export default SubjectUnitComponent;
