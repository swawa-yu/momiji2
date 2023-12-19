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
const updateTableWithSearchOptions = (
    options: SearchOptions,
    index: number,
    displayedIndex: number
) => {
    subjectCodeList.forEach((subjectCode) => {
        subjectMap[subjectCode];
    });
};

// TODO (オ) のオープン科目の扱い
export let numberOfSubjectsToShow = 100;

function SyllabusTable() {
    // initializeSubject();
    console.log(propertyToShowList);
    subjectCodeList.forEach((subjectCode) => {
        if (subjectCode === '10000100') {
            console.log(subjectCode);
        }
    });
    // updateTableWithSearchOptions();

    const data = React.useMemo(
        () => subjectCodeList.map(subjectCode => subjectMap[subjectCode]),
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
    );
}

export default SyllabusTable;
