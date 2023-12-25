import React from 'react';
import { useTable } from 'react-table';

import {
    subjectCodeList,
    subjectMap,
    propertyToShowList,
} from '../subject';

import './SyllabusTable.css';
import { SearchOptions } from '../subject/search';

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

function SyllabusTableRaw() {
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
            <div className='table-wrapper'>行数: {rows.length}</div> {/* 行数を表示 */}
            <div>検索条件: campus={searchOptions.campus}</div> {/* 行数を表示 */}

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
                                    const displayedText =
                                        cellText.length > maxCharacters
                                            ? cellText.substring(0, maxCharacters) + '...' // 制限を超える場合に...を追加
                                            : cellText; // 制限以内の場合はそのまま表示
                                    return <td {...cell.getCellProps()}>{displayedText}</td>;
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