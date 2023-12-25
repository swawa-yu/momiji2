import React from 'react';
import SubjectUnitComponent from './SubjectUnitComponent';
import {
    subjectCodeList,
    subjectMap,
    // propertyToShowList,
} from './';

import './SyllabusTable.css';
import { SearchOptions } from './search';

const fillteredSubjectCodeList = (options: SearchOptions) => {
    return subjectCodeList.filter((subjectCode) =>
        (subjectMap[subjectCode]["開講キャンパス"] === options.campus)
    );
};

export let numberOfSubjectsToShow = 100;

function SyllabusTable() {
    const maxNumberOfSubjectsToShow = 1000;
    const searchOptions: SearchOptions = {
        campus: "霞",
    }

    // 開講キャンパスは霞で絞っている
    const data = React.useMemo(
        () => fillteredSubjectCodeList(searchOptions).slice(0, maxNumberOfSubjectsToShow).map(subjectCode => subjectMap[subjectCode]),
        []
    );

    return (
        <>
            <div className='table-wrapper'>行数: {data.length}</div> {/* 行数を表示 */}
            <div>検索条件: campus={searchOptions.campus}</div> {/* 検索条件を表示 */}

            {/* LectureUnit コンポーネントを使用して授業を表示 */}
            <div className="lectures-container">
                {data.map((subject, index) => (
                    <SubjectUnitComponent key={index} subjectData={subject} />
                ))}
            </div>
        </>
    );
}

export default SyllabusTable;
