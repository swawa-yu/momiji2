// import { HtmlHTMLAttributes, useState } from 'react'
import './App.css'

import {
    // Subject,
    initializeSubject, subjectCodeList,
    // subjectCodeList,
    // subjectMap,
    // NormalSeasons,
    // Modules,
} from './subject';
// import * as timetable from './timetable';
// import * as bookmark from './bookmark';
// import codeTypes from './code-types.json';
// import { matchesSearchOptions, SearchOptions } from './subject/search';
// import { renderSubjectAsTableRow, renderSubjectForMobile } from './subject/render';
import SyllabusTable from './subject/SyllabusTable';
import { numberOfSubjectsToShow } from './subject/SyllabusTable';
// import Grid from './subject/Grid';


// const updateTable = (options: SearchOptions, index: number, displayedIndex: number) => {
// const updateTable = () => {
// subjectCodeList.forEach(subjectCode => {
//     subjectMap[subjectCode]
// });
// const tr = renderSubjectAsTableRow(subject);
// dom.tbody.appendChild(tr);

// Make bookmark buttons active
// (document.getElementById('bookmark-' + subject.code) as HTMLInputElement).checked =
//     bookmarks.includes(subject.code);
// };
// const search = (e: Event | null) => {
//     if (e != null) {
//         e.stopPropagation();
//     }
//     dom.tbody.innerHTML = '';
//     dom.bodyMobile.innerHTML = '';

//     let season: NormalSeasons | undefined;
//     let module: Modules | undefined;
//     if (isMobile()) {
//         let seasonModule = dom.selectModule?.options[dom.selectModule.selectedIndex].value as string;
//         if (seasonModule != 'null') {
//             const firstChar = seasonModule.slice(0, 1);
//             const secondChar = seasonModule.slice(1);
//             if (firstChar === '春' || firstChar === '秋') {
//                 season = firstChar;
//             }
//             if (secondChar === 'A' || secondChar === 'B' || secondChar === 'C') {
//                 module = secondChar;
//             }
//         }
//     } else {
//         if (dom.form.season.value != 'null') {
//             season = dom.form.season.value;
//         }
//         if (dom.form.module.value != 'null') {
//             module = dom.form.module.value;
//         }
//     }

//     let options: SearchOptions = {
//         keyword: dom.keyword.value,
//         reqA: dom.reqA.options[dom.reqA.selectedIndex].value,
//         reqB: dom.reqB.selectedIndex > -1 ? dom.reqB.options[dom.reqB.selectedIndex].value : 'null',
//         reqC: dom.reqC.selectedIndex > -1 ? dom.reqC.options[dom.reqC.selectedIndex].value : 'null',
//         online: dom.form.online.value,
//         year: dom.form.year.value,
//         containsName: dom.checkbox.name.checked,
//         containsCode: dom.checkbox.no.checked,
//         containsRoom: dom.checkbox.room.checked,
//         containsPerson: dom.checkbox.person.checked,
//         containsAbstract: dom.checkbox.abstract.checked,
//         containsNote: dom.checkbox.note.checked,
//         filter: dom.form.bookmark.value,
//         periods: timetable.selectedPeriods,
//         disablePeriods: timetable.dom.checkExcludeBookmark.checked ? timetable.disablePeriods : null,
//         concentration: timetable.dom.checkConcentration.checked,
//         negotiable: timetable.dom.checkNegotiable.checked,
//         asneeded: timetable.dom.checkAsNeeded.checked,
//         season,
//         module,
//     };

//     clearTimeout(timeout);
//     bookmarks = bookmark.getBookmarks();
//     updateTable(options, 0, 0);
// };

// window.onload = function () {
//     // initialize DOM
//     dom = {
//         form: document.getElementsByTagName('form')[0] as HTMLFormElement,
//         keyword: document.getElementById('keyword') as HTMLInputElement,
//         reqA: document.getElementById('req-a') as HTMLSelectElement,
//         reqB: document.getElementById('req-b') as HTMLSelectElement,
//         reqC: document.getElementById('req-c') as HTMLSelectElement,
//         selectModule: null,
//         selectDay: null,
//         selectPeriod: null,
//         submit: document.getElementById('submit') as HTMLAnchorElement,
//         clear: document.getElementById('clear') as HTMLAnchorElement,
//         checkbox: {
//             name: document.getElementById('check-name') as HTMLInputElement,
//             no: document.getElementById('check-no') as HTMLInputElement,
//             person: document.getElementById('check-person') as HTMLInputElement,
//             room: document.getElementById('check-room') as HTMLInputElement,
//             abstract: document.getElementById('check-abstract') as HTMLInputElement,
//             note: document.getElementById('check-note') as HTMLInputElement,
//         },
//         footer: {
//             download: document.getElementById('download') as HTMLAnchorElement,
//             updatedDate: document.getElementById('updated-date') as HTMLSpanElement,
//         },
//         bookmarkInfo: document.getElementById('bookmark-info') as HTMLDivElement,
//         table: document.getElementById('body') as HTMLTableElement,
//         tbody: document.querySelector('table#body tbody') as HTMLElement,
//         bodyMobile: document.getElementById('body-mobile') as HTMLDivElement,
//     };
//     timetable.initialize();

//     // associate the display on mobile and desktop
//     const keywordOptionsMobile = Array.from(document.querySelectorAll('#keyword-options-sp li'));
//     const keywordOptionsDesktop = [
//         dom.checkbox.name,
//         dom.checkbox.no,
//         dom.checkbox.room,
//         dom.checkbox.person,
//         dom.checkbox.abstract,
//         dom.checkbox.note,
//     ];

//     const syncKeywordOptionsDisplay = (index: number) => {
//         // bookmark
//         if (index === 6) {
//             if (dom.form.bookmark.value === 'bookmark') {
//                 keywordOptionsMobile[index].classList.add('selected');
//             } else {
//                 keywordOptionsMobile[index].classList.remove('selected');
//             }
//         } else {
//             if (keywordOptionsDesktop[index].checked) {
//                 keywordOptionsMobile[index].classList.add('selected');
//             } else {
//                 keywordOptionsMobile[index].classList.remove('selected');
//             }
//         }
//     };

//     keywordOptionsMobile.forEach((li, index) => {
//         li.addEventListener('click', () => {
//             // bookmark
//             if (index === 6) {
//                 console.log('!!');
//                 dom.form.bookmark.value = li.classList.contains('selected') ? 'all' : 'bookmark';
//                 syncKeywordOptionsDisplay(index);
//             } else {
//                 keywordOptionsDesktop[index].checked = !keywordOptionsDesktop[index].checked;
//                 syncKeywordOptionsDisplay(index);
//             }
//         });
//     });

//     const syncRadio = (lists: Element[], options: RadioNodeList) => {
//         lists.forEach((list, index) => {
//             if ((options[index] as HTMLInputElement).value == options.value) {
//                 list.classList.add('selected');
//             } else {
//                 list.classList.remove('selected');
//             }
//         });
//     };

//     const initializeRadio = (lists: Element[], options: RadioNodeList) => {
//         lists.forEach((li, index) => {
//             li.addEventListener('click', () => {
//                 options.value = (options[index] as HTMLInputElement).value;
//                 syncRadio(lists, options);
//             });
//             syncRadio(lists, options);
//         });
//     };

//     keywordOptionsDesktop.forEach((element, index) => {
//         element.addEventListener('change', () => syncKeywordOptionsDisplay(index));
//         syncKeywordOptionsDisplay(index);
//     });

//     const classMethodMobileLists = Array.from(document.querySelectorAll('#class-method-mobile li'));
//     const yearMobileLists = Array.from(document.querySelectorAll('#year-mobile li'));
//     initializeRadio(classMethodMobileLists, dom.form.online);
//     initializeRadio(yearMobileLists, dom.form.year);

//     // if the device is iOS, displayed lines are limited 100.
//     const isIOS = ['iPhone', 'iPad', 'iPod'].some((name) => navigator.userAgent.indexOf(name) > -1);
//     lineLimit = isIOS ? 100 : 1000;

//     const clear = (evt: Event) => {
//         evt.stopPropagation();
//         dom.keyword.value = '';
//         dom.reqA.selectedIndex = 0;
//         deleteOptions(dom.reqB);
//         deleteOptions(dom.reqC);
//         dom.form.bookmark.value = 'all';
//         dom.form.season.value = 'null';
//         dom.form.module.value = 'null';
//         dom.form.online.value = 'null';
//         dom.form.year.value = 'null';

//         dom.checkbox.name.checked = true;
//         dom.checkbox.no.checked = true;
//         dom.checkbox.person.checked = false;
//         dom.checkbox.room.checked = false;
//         dom.checkbox.abstract.checked = false;
//         dom.checkbox.note.checked = false;
//         dom.form.checked = false;

//         timetable.clear();

//         keywordOptionsDesktop.forEach((_, index) => {
//             syncKeywordOptionsDisplay(index);
//         });
//         syncRadio(classMethodMobileLists, dom.form.online);
//         syncRadio(yearMobileLists, dom.form.year);
//     };

//     const resized = () => {
//         dom.clear.removeEventListener('click', clear);
//         let supportsTouch = 'ontouchend' in document;
//         timetable.dom.display.removeEventListener(
//             supportsTouch ? 'touchstart' : 'click',
//             timetable.display
//         );

//         if (isMobile()) {
//             dom.selectModule = document.getElementById('select-module') as HTMLSelectElement;
//             dom.selectDay = document.getElementById('select-day') as HTMLSelectElement;
//             dom.selectPeriod = document.getElementById('select-period') as HTMLSelectElement;
//             dom.submit = document.getElementById('submit-sp') as HTMLAnchorElement;
//             dom.clear = document.getElementById('clear-sp') as HTMLAnchorElement;
//             timetable.dom.display = document.getElementById('display-timetable-sp') as HTMLAnchorElement;
//         } else {
//             dom.submit = document.getElementById('submit') as HTMLAnchorElement;
//             dom.clear = document.getElementById('clear') as HTMLAnchorElement;
//             timetable.dom.display = document.getElementById('display-timetable') as HTMLAnchorElement;
//         }

//         timetable.dom.display.innerHTML = isMobile() ? '曜日・時限を選択' : '選択';
//         dom.submit.addEventListener('click', search);
//         dom.clear.addEventListener('click', clear);
//         timetable.dom.display.addEventListener('click', timetable.display);
//     };
//     resized();
//     window.addEventListener('resize', resized, { passive: true });
//     bookmark.initialize();

//     // search
//     dom.keyword.addEventListener('keydown', (evt) => {
//         if (evt.key == 'Enter') {
//             evt.preventDefault();
//             search(evt);
//         }
//     });
//     dom.submit.addEventListener('click', search);

//     // convert table data to CSV file with utf-8 BOM
//     const makeCSV = (a: HTMLAnchorElement, table: HTMLTableElement, filename: string) => {
//         const escaped = /,|\r?\n|\r|"/;
//         const e = /"/g;

//         var bom = new Uint8Array([0xef, 0xbb, 0xbf]);
//         const csv = [],
//             row = [];
//         for (let r = 0; r < table.rows.length; r++) {
//             row.length = 0;
//             for (let c = 0; c < table.rows[r].cells.length; c++) {
//                 const field = table.rows[r].cells[c].innerText
//                     .trim()
//                     .replace('シラバスシラバス（ミラー)', '');
//                 row.push(escaped.test(field) ? '"' + field.replace(e, '""') + '"' : field);
//             }
//             csv.push(row.join(',').replace('\n",', '",'));
//         }

//         var blob = new Blob([bom, csv.join('\n')], { type: 'text/csv' });

//         if ((window.navigator as any).msSaveBlob) {
//             // IE
//             (window.navigator as any).msSaveBlob(blob, filename);
//         } else {
//             a.download = filename;
//             a.href = window.URL.createObjectURL(blob);
//         }
//     };

//     // get YYYYMMDDhhmmdd
//     const getDateString = () => {
//         let date = new Date();
//         let Y = date.getFullYear();
//         let M = ('00' + (date.getMonth() + 1)).slice(-2);
//         let D = ('00' + date.getDate()).slice(-2);
//         let h = ('0' + date.getHours()).slice(-2);
//         let m = ('0' + date.getMinutes()).slice(-2);
//         let d = ('0' + date.getSeconds()).slice(-2);
//         return Y + M + D + h + m + d;
//     };

//     // download CSV file: `kdb_YYYYMMDDhhmmdd.csv`
//     dom.footer.download.addEventListener('click', () => {
//         makeCSV(dom.footer.download, dom.table, `kdb_${getDateString()}.csv`);
//     });

//     const constructOptions = (select: HTMLSelectElement, types: { [key: string]: any }) => {
//         deleteOptions(select);
//         let option = document.createElement('option');
//         option.value = 'null';
//         option.innerHTML = '指定なし';
//         select.appendChild(option);

//         for (let key in types) {
//             let option = document.createElement('option');
//             option.innerHTML = key;
//             select.appendChild(option);
//         }
//     };

//     const selectOnChange = (isA: boolean) => {
//         deleteOptions(dom.reqC);
//         const selected = isA ? dom.reqA : dom.reqB;
//         const selectedValue = selected.options[selected.selectedIndex].value;
//         const subSelect = isA ? dom.reqB : dom.reqC;
//         const reqA_value = dom.reqA.options[dom.reqA.selectedIndex].value;
//         const reqB_value =
//             dom.reqB.selectedIndex > -1 ? dom.reqB.options[dom.reqB.selectedIndex].value : 'null';

//         if (selectedValue == 'null') {
//             deleteOptions(subSelect);
//         } else {
//             let types = isA
//                 ? (codeTypes as any)[reqA_value]
//                 : (codeTypes as any)[reqA_value].childs[reqB_value];
//             constructOptions(subSelect, types.childs);
//         }
//     };

//     // initialize
//     (async () => {
//         // construct options of requirements
//         constructOptions(dom.reqA, codeTypes);
//         dom.reqA.addEventListener('change', () => selectOnChange(true));
//         dom.reqB.addEventListener('change', () => selectOnChange(false));

//         const updatedDate = await initializeSubject();
//         dom.footer.updatedDate.innerHTML = updatedDate;
//         search(null);

//         // bookmark
//         bookmark.update();

//         let firstBookmark = document.querySelector('input.bookmark');
//         if (!isMobile() && localStorage.getItem('kdb_bookmarks') == null) {
//             dom.bookmarkInfo.style.opacity = '1.0';
//             let bounding = firstBookmark?.getBoundingClientRect() as DOMRect;
//             dom.bookmarkInfo.style.left = bounding.left + 28 + 'px';
//             dom.bookmarkInfo.style.top = bounding.top + 4 + 'px';
//         } else {
//             dom.bookmarkInfo.style.display = 'none';
//         }
//     })();

//     // scroll
//     window.addEventListener('scroll', () => {
//         dom.bookmarkInfo.style.opacity = '0';
//         setTimeout(() => (dom.bookmarkInfo.style.display = 'none'), 300);
//     });

//     const displayMS = 200;
//     document.addEventListener('click', (e: MouseEvent) => {
//         let query = '#timetable, ' + (isMobile() ? '#display-timetable-sp' : '#display-timetable');
//         if (!(e.target as HTMLElement).closest(query)) {
//             timetable.dom.timetable.style.opacity = '0';
//             setTimeout(() => {
//                 timetable.dom.timetable.style.display = 'none';
//             }, displayMS);
//         }
//     });
// };


function App() {
    console.log("App")
    initializeSubject();
    // updateTable();
    return (
        <div>
            <h1>シラバス momiji2</h1>
            <p>開発中です。</p>
            <p>今後の実装予定：
                <ul>
                    <li>検索機能</li>
                    <li>表をきれいに表示する</li>
                    <li>マウスホバーで授業詳細を見ることができるようにする</li>
                    <li>教員のresearchmapのリンク</li>
                    <li>時間割の仮組み機能</li>
                    <li>スマホ対応</li>
                    <li></li>
                </ul></p>
            <p>github: swawa-yu</p>
            <p>twitter: @swawa_yu, @archaic_hohoemi</p>
            <p>参考：KdBっぽいなにか</p>
            <br></br>
            <p>検索条件：なし</p>
            <p>{subjectCodeList.length}個の授業がヒットしました。(うち{numberOfSubjectsToShow}件を表示しています。)</p>
            <SyllabusTable></SyllabusTable>
        </div>
    )
}

export default App

