import React from 'react';
import { useTable } from 'react-table';

import {
    Subject
} from '../subject/types';

import {
    subjectMap,
    propertyToShowList,
} from '../subject';

import './SyllabusTable.css';
import { SearchOptions, filteredSubjectCodeList } from '../search';
import { maxNumberOfSubjectsToShow } from '../table-view';

interface SyllabusTableRaw {
    searchOptions: SearchOptions;
}

function SyllabusTableRaw({ searchOptions }: { searchOptions: SearchOptions }) {

    const data = React.useMemo(() => {
        return filteredSubjectCodeList(searchOptions)
            .slice(0, maxNumberOfSubjectsToShow)
            .map(subjectCode => subjectMap[subjectCode])
    }, [searchOptions]);


    const columns = React.useMemo(
        () => propertyToShowList.map(columnName => ({
            Header: columnName,
            accessor: columnName as keyof Subject,
            width: 150,
        })),
        [propertyToShowList]
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
    });

    return (
        <>
            <div className='table-wrapper'>該当授業数: {filteredSubjectCodeList(searchOptions).length}</div> {/* 行数を表示 */}
            <div className='table-wrapper'>表示数: {data.length} (/最大表示数: {maxNumberOfSubjectsToShow})</div> {/* 行数を表示 */}

            <table {...getTableProps()} className="table-class">
                {/* ヘッダー */}
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                </thead>

                {/* データ */}
                <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()} className='table-row-height'>
                                {row.cells.map(cell => {
                                    const cellText = cell.value;
                                    const maxCharacters = 50; // 制限する文字数

                                    return (
                                        <td {...cell.getCellProps()} title={cell.value}>
                                            {cellText.length > maxCharacters
                                                ? cellText.substring(0, maxCharacters) + '...' // 制限を超える場合に...を追加
                                                : cellText}
                                        </td>
                                    );
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    );
}

export default SyllabusTableRaw;