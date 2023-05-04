import React, { Component } from "react";

import {
    Subject,
    initializeSubject,
    subjectCodeList,
    subjectMap,
    propertyToShowList
} from '.';

import { VariableSizeGrid, GridChildComponentProps } from "react-window";

import styles from './SyllabusTable.module.css'
// import './SyllabusTable.css'

// import { PropsFromToggle } from "react-bootstrap/esm/DropdownToggle";
// import * as timetable from './timetable';
// import * as bookmark from './bookmark';
// import codeTypes from './code-types.json';
// import { matchesSearchOptions, SearchOptions } from './search';
// import { renderSubjectAsTableRow, renderSubjectForMobile } from './render';

// TODO 再帰関数の実装になっているが、なぜ？
// reactなら元データsearch option 変えるだけでできるんじゃね
// const updateTable = (options: SearchOptions, index: number, displayedIndex: number) => {
//     export const updateTable = () => {
//         subjectCodeList.forEach(subjectCode => {
//             subjectMap[subjectCode]
//         });
//     }
// }

// function SyllabusTableHead() {
//     return (
//         <tr key="table-head">
//             {
//                 subjectCodeList.map(subjectCode, index) => (
//             <td>{index}</td>
//             <td>{subjectMap[subjectCode].name}</td>
//             <td>{subjectMap[subjectCode].code}</td>
//             )
//             }
//         </tr>
//     );
// }
// function SyllabusTableRow(props: PropSubjectCode) {
//     return (
//         <tr key={props.subjectCode}>
//             <td>{props.subjectCode}</td>
//             <td>{subjectMap[props.subjectCode].name}</td>
//         </tr >
//     )
// }

// const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => (
//     (rowIndex == 0) ? (
//         <div className={styles.cell} style={style}>
//             {/* Item {rowIndex},{columnIndex} */}
//             {propertyToShowList[columnIndex]}
//             {/* {columnNameList[columnIndex]} */}
//         </div >
//     ) : (
//         <div className={styles.cell} style={style}>
//             {/* Item {rowIndex},{columnIndex} */}
//             {subjectMap[subjectCodeList[rowIndex - 1]][propertyToShowList[columnIndex]]}
//             {/* {columnNameList[columnIndex]} */}
//         </div >
//     )
// );


// const columnWidths: { [key: string]: number } = {
//     "講義コード": 80,
//     "開講部局": 100,
//     "授業科目名": 200,
//     "単位": 40,
// }

// TODO (オ)　のオープン科目の扱い

function SyllabusTable() {
    // initializeSubject();
    console.log(propertyToShowList)
    subjectCodeList.forEach((subjectCode) => {
        if (subjectCode == "10000100") {
            console.log(subjectCode)
        }
    }
    )
    // updateTable();


    return (
        <table>
            <thead>
                {
                    // <tr key="table-head">
                    <tr>
                        {propertyToShowList.map((columnName) =>
                            <td>{columnName}</td>
                        )}
                    </tr >
                }
            </thead>
            <tbody>
                {subjectCodeList.map((subjectCode, index) =>
                    // <tr key={subjectCode}>
                    <tr>
                        {propertyToShowList.map((columnName) =>
                            <td>{subjectMap[subjectCode][columnName]}</td>
                        )}
                    </tr >
                )}
            </tbody>
        </table>
    )


    // react-table を使った実装
    // return (
    //     <VariableSizeGrid
    //         className={styles.grid}
    //         width={1000}
    //         height={900}
    //         columnCount={columnNameList.length}
    //         // columnCount={100}
    //         // rowCount={Object.keys(subjectMap).length}
    //         rowCount={10000}
    //         columnWidth={(index) => (columnNameList[index] in columnWidths ? columnWidths[columnNameList[index]] : 200)}
    //         rowHeight={(index) => 70}
    //     >
    //         {Cell}
    //     </VariableSizeGrid>
    // )
}

export default SyllabusTable
