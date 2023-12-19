import React from 'react';
import { useTable } from 'react-table';

import {
    subjectCodeList,
    subjectMap,
    propertyToShowList,
} from './';

import './SyllabusTable.css';
import { SearchOptions } from './search';

// TODO 要実装
// reactなら元データsearch option 変えるだけでできるんじゃね
// 検索条件で絞り込んだ科目のリスト(講義コードのリスト)を返す
const fillteredSubjectCodeList = (
    options: SearchOptions
) => {
    return subjectCodeList.filter((subjectCode) =>
        (subjectMap[subjectCode]["開講キャンパス"] === options.campus)
    );
};

// TODO (オ) のオープン科目の扱い
export let numberOfSubjectsToShow = 100;

function SyllabusTable() {
    // initializeSubject();

    // コンソール出力\
    // console.log(propertyToShowList);
    // subjectCodeList.forEach((subjectCode) => {
    //     if (subjectCode === '10000100') {
    //         console.log(subjectCode);
    //     }
    // });

    // 先頭の1000件だけ表示
    const maxNumberOfSubjectsToShow = 1000;


    const searchOptions: SearchOptions = {
        campus: "霞",
    }

    // 開講キャンパスは霞で絞っている
    const data = React.useMemo(
        () => fillteredSubjectCodeList(searchOptions).slice(0, maxNumberOfSubjectsToShow).map(subjectCode => subjectMap[subjectCode]),
        [subjectCodeList, subjectMap]
    );


    const columns = React.useMemo(
        () => propertyToShowList.map(columnName => ({
            Header: columnName,
            accessor: columnName,
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
            <div>行数: {rows.length}</div> {/* 行数を表示 */}
            <div>検索条件: campus={searchOptions.campus}</div> {/* 行数を表示 */}
            <table {...getTableProps()} className="your-table-class">
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return (
                                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    );
}

export default SyllabusTable;
