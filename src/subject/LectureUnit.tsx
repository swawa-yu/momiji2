// LectureUnit.tsx
import React from 'react';
// import {
//     subjectCodeList,
//     subjectMap,
// } from './';


type LectureUnitProps = {
    // 必要なプロパティを定義
    subjectData: any; // 適切な型に変更してください
};

const LectureUnit: React.FC<LectureUnitProps> = ({ subjectData }) => {
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
