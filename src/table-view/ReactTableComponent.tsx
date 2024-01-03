import React from 'react';
import { useTable, Row, Column } from 'react-table';
import './ReactTableComponent.css';
import { Subject2 } from '../subject/types';
import BookmarkButton from '../BookmarkButton';
import { convertURLtoAbsolute } from '../subject/utils';

interface ReactTableComponentProps {
    subjectsToShow: Subject2[];
    bookmarkedSubjects: Set<string>;
    handleBookmarkToggle: (lectureCode: string) => void;
}
const ReactTableComponent: React.FC<ReactTableComponentProps> = React.memo(({ subjectsToShow }) => {
    const columns = React.useMemo(
        () => [
            {
                Header: '☆',
                Cell: ({ row }: { row: Row<Subject2> }) => (
                    <BookmarkButton lectureCode={row.original["講義コード"]}></BookmarkButton>
                )
            },
            {
                Header: '講義コード・授業科目名',
                Cell: ({ row }: { row: Row<Subject2> }) => (
                    <div className='lecture-code-name'>
                        <a href={convertURLtoAbsolute(row.original["relative URL"])} target="_blank" rel="noopener noreferrer" title="新しいタブでシラバスを開く">
                            {row.original['講義コード']}
                        </a>
                        <br></br>
                        {row.original['授業科目名']}
                    </div>
                )
            },
            {
                Header: '担当教員',
                Cell: ({ row }: { row: Row<Subject2> }) => (
                    <div className='teacher'>
                        <ul>
                            {row.original["担当教員名"].map((teacher, index) => {
                                const query = encodeURIComponent(teacher.split(' ').join(' '));
                                const researchMapUrl = `https://researchmap.jp/researchers?q=${query}`;
                                return (
                                    <li key={index}>
                                        <a href={researchMapUrl} target="_blank" rel="noopener noreferrer">{teacher}</a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )
            },
            {
                Header: '開設期',
                Cell: ({ row }: { row: Row<Subject2> }) => (
                    <div className='kaisetsuki'>
                        {row.original["開設期"]}
                    </div>
                )
            },
            {
                Header: '曜日・時限・講義室',
                Cell: ({ row }: { row: Row<Subject2> }) => (
                    <div className='schedule'>
                        {row.original["曜日・時限・講義室"]}
                    </div>
                )
            },
            {
                Header: 'キャンパス・言語',
                Cell: ({ row }: { row: Row<Subject2> }) => (
                    <div className='campus-language'>
                        {row.original["開講キャンパス"]}
                        <br></br>
                        {row.original["使用言語"]}
                    </div>
                )
            },
            {
                Header: '概要',
                Cell: ({ row }: { row: Row<Subject2> }) => (
                    <div className='abstract'>
                        {row.original["授業の目標・概要等"]}
                    </div>
                )
            }
        ],
        []
    ) as Column<Subject2>[];



    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data: subjectsToShow });

    return (
        <table {...getTableProps()} className='syllabus-table'>
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
                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
});

export default ReactTableComponent;
