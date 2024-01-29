import React, { useState, useContext } from 'react';
import { BookmarkContext } from '../../contexts/BookmarkContext';

import SyllabusTableRaw from './SyllabusTableRaw';
import {
    subjectMap,
    subject2Map,
} from '../../subject';

import { SearchOptions } from '../../types/search';
import { filterSubjectCodeList } from '../../search';
import ReactTableComponent from './ReactTableComponent';

interface TableViewProps {
    searchOptions: SearchOptions;
}


function TableView({ searchOptions }: TableViewProps) {

    const [isTableRaw, setIsTableRaw] = useState(false);

    const defaultMaxNumberOfSubjectsToShow = 100;
    const [maxNumberOfSubjectsToShow, setMaxNumberOfSubjectsToShow] = useState(defaultMaxNumberOfSubjectsToShow);
    const handleMaxSubjectsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        setMaxNumberOfSubjectsToShow(isNaN(value) ? 100 : value);
    };

    // const filteredSubjectCodeList = React.useMemo(() => filterSubjectCodeList(searchOptions), [searchOptions]);
    // const filteredSubjectCodes = filterSubjectCodeList(searchOptions);
    const bookmarkedSubjects = useContext(BookmarkContext).bookmarkedSubjects;
    const filteredSubjectCodes = React.useMemo(() => filterSubjectCodeList(searchOptions, bookmarkedSubjects), [searchOptions]);


    const filteredSubjects = React.useMemo(() => { return filteredSubjectCodes.map(subjectCode => subjectMap[subjectCode]) }, [searchOptions]);
    const filteredSubjects2 = React.useMemo(() => { return filteredSubjectCodes.map(subjectCode => subject2Map[subjectCode]) }, [searchOptions]);

    const subjectsToShow = React.useMemo(() => { return filteredSubjects.slice(0, maxNumberOfSubjectsToShow); }, [filteredSubjects, maxNumberOfSubjectsToShow]);
    const subjects2ToShow = React.useMemo(() => { return filteredSubjects2.slice(0, maxNumberOfSubjectsToShow); }, [filteredSubjects2, maxNumberOfSubjectsToShow]);

    return (
        <div>
            <div className='table-wrapper'>該当授業数: {filteredSubjects.length}</div> {/* 行数を表示 */}
            <div className='table-wrapper'>表示数: {subjectsToShow.length} (/{
                <div className='table-wrapper'>
                    <label htmlFor="max-subjects">最大表示数: </label>
                    <input
                        id="max-subjects"
                        type="number"
                        value={maxNumberOfSubjectsToShow}
                        onChange={handleMaxSubjectsChange}
                        min="1" // 最小値を設定
                        max="20000" // 理論上の最大値を設定
                    />
                </div>
            }(※表示数を多くすると処理が重くなります))</div> {/* 行数を表示 */}
            <button onClick={() => setIsTableRaw(!isTableRaw)}>
                {isTableRaw ? "見やすい表に切り替える" : "基本データ表に切り替える"}
            </button>
            {isTableRaw ?
                <SyllabusTableRaw subjectsToShow={subjectsToShow} ></SyllabusTableRaw> :
                <ReactTableComponent subjectsToShow={subjects2ToShow}></ReactTableComponent>}
        </div>
    );
}

export default TableView;
