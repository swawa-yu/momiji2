import React from 'react';
import { useTable } from 'react-table';

import {
    Subject
} from '../../types/subject';

import {
    propertyToShowList,
} from '../../subject';

import './SyllabusTableRaw.css';

interface SyllabusTableRaw {
    subjectsToShow: Subject[];
}

function SyllabusTableRaw({ subjectsToShow: subjectsToShow }: SyllabusTableRaw) {

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
        data: subjectsToShow
    });

    return (
        <>
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