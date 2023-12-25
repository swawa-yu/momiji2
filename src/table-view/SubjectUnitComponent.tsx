// LectureUnit.tsx
import React from 'react';
// import {
//     subjectCodeList,
//     subjectMap,
// } from './';

import './SubjectUnitComponent.css'
// import { parseKaisetsuki, parseSchedule } from '../subject/parser'
import { Subject } from '../subject';


type SubjectUnitComponentProps = {
    // 必要なプロパティを定義
    subject: Subject; // 適切な型に変更してください
};


const SubjectUnitComponent: React.FC<SubjectUnitComponentProps> = ({ subject: subject }) => {
    // const schedules = parseSchedule(subject["曜日・時限・講義室"]);
    // const kaisetsuki = parseKaisetsuki(subject["開設期"]);

    return (
        <div className="lecture-details">
            <div className="star-button">★</div>
            <div className="lecture-code-name">
                <div className="lecture-code">{subject["講義コード"]}</div>
                <div className="lecture-name">{subject["授業科目名"]}</div> </div>
            <div className="instructor">{subject["担当教員名"]}</div>
            <div className="lecture-details-columns">
                <div>{subject["開設期"]}</div>
                <div>{subject["曜日・時限・講義室"]}</div>
                {/* <div>セメスター：{kaisetsuki.semester}</div> */}
                {/* <div>履修年次：{kaisetsuki.rishuNenji}</div>
                <div>時期区分(開設期)：{kaisetsuki.jikiKubun}</div>
                <div>時期区分(schedules)：{schedules[0].jikiKubun}</div> */}
                {/* <div>曜日：{schedules[0].jigen?.youbi[0]}</div>
                <div>時限Range：{schedules[0].jigen?.jigenRange[0]}-{schedules[0].jigen?.jigenRange[1]}</div>
                <div>コマRange：{schedules[0].jigen?.komaRange[0]}-{schedules[0].jigen?.komaRange[1]}</div> */}
                {/* <div>講義室：{schedules[0].room}</div> */}
                <div>{subject["開講キャンパス"]}</div>
                {/* <div>対象学生：{subject["対象学生"]}</div> */}
                {/* <div>{subject["使用言語"]}</div> */}
            </div>
            <div className="lecture-details-info">
                <div>{subject["授業の目標・概要等"]}</div>
                <div>{subject["メッセージ"]}</div>
            </div>
        </div>
    );
};

export default SubjectUnitComponent;
