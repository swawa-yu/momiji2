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
}


function SyllabusTable({ searchOptions }: SyllabusTableProps) {

    const data = useMemo(() => {
        return filteredSubjectCodeList(searchOptions)
            .slice(0, maxNumberOfSubjectsToShow)
            .map(code => subjectMap[code]);
    }, [searchOptions]);

    return (
        <>
            <div className='table-wrapper'>該当授業数: {filteredSubjectCodeList(searchOptions).length}</div> {/* 行数を表示 */}
            <div className='table-wrapper'>表示数: {data.length} (/最大表示数: {maxNumberOfSubjectsToShow})</div> {/* 行数を表示 */}

            {/* LectureUnit コンポーネントを使用して授業を表示 */}
            <div className="lectures-container">
                {data.map((subject, index) => (
                    <SubjectUnitComponent key={index} subject={subject} />
                ))}
            </div>
        </>
    );
}

export default SyllabusTable;
