import SubjectUnitComponent from './SubjectUnitComponent';

import './SyllabusTable.css';
import { Subject2 } from '../subject/types';

interface SyllabusTableProps {
    subjectsToShow: Subject2[];
    bookmarkedSubjects: Set<string>;
    handleBookmarkToggle: (lectureCode: string) => void;
}


function SyllabusTable({ subjectsToShow: subjectsToShow, bookmarkedSubjects, handleBookmarkToggle }: SyllabusTableProps) {
    return (
        <>
            <div className='lecture-details-header'>
                <div className='star-button-header'></div>
                <div className='lecture-code-name-header'>講義コード・授業科目名</div>
                <div className='teacher-header'>担当教員</div>
                <div className='kaisetsuki-header'>開設期</div>
                <div className='schedule-header'>曜日・時限・講義室</div>
                <div className='campus-language-header'>キャンパス・言語</div>
                <div className='abstract-header'>授業の目標・概要等</div>
            </div>
            {/* LectureUnit コンポーネントを使用して授業を表示 */}
            <div className="lectures-container">
                {subjectsToShow.map((subject, index) => (
                    <SubjectUnitComponent key={index} subject={subject} isBookmarked={bookmarkedSubjects.has(subject["講義コード"])} onBookmarkToggle={handleBookmarkToggle} />
                ))}
            </div>
        </>
    );
}

export default SyllabusTable;
