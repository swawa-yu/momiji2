import React from 'react';
import './SubjectUnitComponent.css'
import { Subject2 } from '../subject/types';


type SubjectUnitComponentProps = {
    subject: Subject2;
    isBookmarked: boolean;
    onBookmarkToggle: (lectureCode: string) => void;
};


const SubjectUnitComponent: React.FC<SubjectUnitComponentProps> = ({ subject, isBookmarked, onBookmarkToggle }) => {
    return (
        <div className="lecture-details">
            <div className="star-button" onClick={() => onBookmarkToggle(subject["講義コード"])}>
                {isBookmarked ? "★" : "☆"}
            </div>
            <div className="lecture-code-name">
                <div className="lecture-code">
                    <a href={'https://momiji.hiroshima-u.ac.jp/syllabusHtml/' + subject["relative URL"]} target="_blank" rel="noopener noreferrer" title="新しいタブでシラバスを開く">
                        {subject["講義コード"]}<span className="new-tab-icon">🔗</span>
                    </a>
                </div>
                <div className="lecture-name">{subject["授業科目名"]}</div>
            </div>
            {/* 広島大学研究者総覧：https://seeds.office.hiroshima-u.ac.jp/search/result.html?f&p&n=名字+名前&rf&rg&as&cc&mAdvance&lang=ja */}
            <div className="teacher">
                <ul>
                    {subject["担当教員名"].map((teacher, index) => {
                        const query = encodeURIComponent(teacher.split(' ').join(' '));
                        const researchMapUrl = `https://researchmap.jp/researchers?q=${query}`;
                        return (
                            <li key={index}>
                                <a href={researchMapUrl} target="_blank" rel="noopener noreferrer">{teacher}</a>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className='kaisetsuki'>{subject["開設期"]}</div>
            <div className='schedule'>{subject["曜日・時限・講義室"]}</div>

            <div className='campus-language'>
                <div className="campus">{subject["開講キャンパス"]}</div>
                <div className="language">{subject["使用言語"]}</div>
            </div>

            <div className='abstract'>
                <div className="abstract-text">{subject["授業の目標・概要等"]}</div>
            </div>
        </div>
    );
};

export default SubjectUnitComponent;
