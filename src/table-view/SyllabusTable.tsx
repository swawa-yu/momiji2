import { useMemo } from 'react';
import SubjectUnitComponent from './SubjectUnitComponent';
import { subjectMap } from '../subject';

import './SyllabusTable.css';
import { maxNumberOfSubjectsToShow } from '../table-view';
// import { Subject } from '../subject';
import { SearchOptions } from '../search';
import { filteredSubjectCodeList } from '../search';

interface SyllabusTableProps {
    searchOptions: SearchOptions;
    bookmarkedSubjects: Set<string>;
    handleBookmarkToggle: (lectureCode: string) => void;
}


function SyllabusTable({ searchOptions, bookmarkedSubjects, handleBookmarkToggle }: SyllabusTableProps) {

    const data = useMemo(() => {
        return filteredSubjectCodeList(searchOptions)
            .slice(0, maxNumberOfSubjectsToShow)
            .map(code => subjectMap[code]);
    }, [searchOptions]);

    return (
        <>
            <div className='table-wrapper'>該当授業数: {filteredSubjectCodeList(searchOptions).length}</div> {/* 行数を表示 */}
            <div className='table-wrapper'>表示数: {data.length} (/最大表示数: {maxNumberOfSubjectsToShow})</div> {/* 行数を表示 */}


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
                {data.map((subject, index) => (
                    <SubjectUnitComponent key={index} subject={subject} isBookmarked={bookmarkedSubjects.has(subject["講義コード"])} onBookmarkToggle={handleBookmarkToggle} />
                ))}
            </div>
        </>
    );
}

export default SyllabusTable;
