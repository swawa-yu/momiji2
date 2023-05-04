import { isMobile } from './App';
import * as timetable from './timetable';
import { subjectMap } from './subject';

export const getBookmarks = () => {
  const value = localStorage.getItem('kdb_bookmarks');
  return value != null
    ? decodeURIComponent(value)
      .split(',')
      .filter((code) => code !== '')
    : [];
};

const saveBookmark = (bookmarks: string[]) => {
  let value = '';
  for (let i = 0; i < bookmarks.length; i++) {
    value += ',' + bookmarks[i];
  }
  value = encodeURIComponent(value.substr(1, value.length - 1));
  localStorage.setItem('kdb_bookmarks', value);
};

const removeBookmark = (subjectCode: string) => {
  const bookmarks = getBookmarks();
  if (!bookmarks.includes(subjectCode)) {
    return false;
  } else {
    const newBookmarks = bookmarks.filter((value) => value !== subjectCode);
    saveBookmark(newBookmarks);
    return true;
  }
};

export const onBookmarkChanged = (checked: boolean, code: string) => {
  if (checked) {
    let bookmarks = getBookmarks();
    if (bookmarks.includes(code)) {
      return;
    } else {
      bookmarks.push(code);
      saveBookmark(bookmarks);
    }
  } else {
    removeBookmark(code);
  }
  update();
  if (subjectMap[code].termCodes.length > 0 && subjectMap[code].termCodes[0].length > 0) {
    switchTimetable(subjectMap[code].termCodes[0][0]);
  }
};

const changeBookmarkButton = (code: string) => {
  // desktop
  let bookmark = document.getElementById('bookmark-' + code);
  if (bookmark != null) {
    (bookmark as HTMLInputElement).checked = false;
  }

  // mobile
  let addBookmarkAnchor = document.getElementById('add-bookmark-' + code);
  let removeBookmarkAnchor = document.getElementById('remove-bookmark-' + code);
  if (addBookmarkAnchor != null) {
    (addBookmarkAnchor as HTMLAnchorElement).style.display = 'block';
    (removeBookmarkAnchor as HTMLAnchorElement).style.display = 'none';
  }
};

const clearBookmarks = () => {
  const isApproved = window.confirm('すべてのお気に入りの科目が削除されます。よろしいですか？');
  if (!isApproved) {
    return;
  }

  const bookmarks = getBookmarks();
  for (let subjectId of bookmarks) {
    removeBookmark(subjectId);
    changeBookmarkButton(subjectId);
  }
  update();
};

// timetable displaying blookmarked subjects
const maxModule = 6;
let timetableWidth: number;
let displayingModule = 0;
let displaysTimetable = true;

let dom: {
  main: HTMLDivElement;
  tableList: HTMLUListElement;
  periods: HTMLLIElement[][][];
  module: HTMLSpanElement;
  credit: HTMLSpanElement;
  previous: HTMLAnchorElement;
  next: HTMLAnchorElement;
  close: HTMLAnchorElement;
  exportTwinte: HTMLAnchorElement;
  clear: HTMLAnchorElement;
};

const switchDisplayTimetable = (animates: boolean) => {
  dom.main.style.transition = animates ? 'margin-bottom 0.5s ease' : '';
  dom.main.style.marginBottom = displaysTimetable
    ? `calc(${-dom.main.clientHeight}px + 1.8rem)`
    : '0';
  displaysTimetable = !displaysTimetable;
  dom.close.innerHTML = displaysTimetable ? '×' : '︿';
  if (displaysTimetable) {
    dom.close.classList.remove('closed');
  } else {
    dom.close.classList.add('closed');
  }
};

const switchTimetable = (no: number) => {
  if (displayingModule != no && no < 6) {
    displayingModule = no;
    dom.tableList.style.marginLeft = timetableWidth * displayingModule * -1 + 'px';
    update();
  }
};

const shiftTimetable = (isForward: boolean) => {
  const maxModule = 5;
  if (isForward && displayingModule < maxModule) {
    switchTimetable(displayingModule + 1);
  }
  if (!isForward && displayingModule > 0) {
    switchTimetable(displayingModule - 1);
  }
};

const exportToTwinte = () => {
  // https://github.com/twin-te/twinte-front/pull/529
  const baseUrl = 'https://app.twinte.net/import?codes=';
  window.open(baseUrl + getBookmarks().join(','));
};

export const initialize = () => {
  dom = {
    main: document.querySelector('#bookmark-timetable .main') as HTMLDivElement,
    tableList: document.querySelector('#bookmark-timetable ul.table-list') as HTMLUListElement,
    periods: [],
    module: document.querySelector('#current-status .module') as HTMLSpanElement,
    credit: document.querySelector('#current-status .credit') as HTMLSpanElement,
    previous: document.querySelector('#current-status .previous') as HTMLAnchorElement,
    next: document.querySelector('#current-status .next') as HTMLAnchorElement,
    close: document.querySelector('#close-bookmark-table') as HTMLAnchorElement,
    exportTwinte: document.querySelector('#export-twinte') as HTMLAnchorElement,
    clear: document.querySelector('#clear-bookmarks') as HTMLAnchorElement,
  };

  dom.clear.addEventListener('click', () => clearBookmarks());
  dom.previous.addEventListener('click', () => shiftTimetable(false));
  dom.next.addEventListener('click', () => shiftTimetable(true));
  dom.exportTwinte.addEventListener('click', () => exportToTwinte());
  dom.close.addEventListener('click', () => switchDisplayTimetable(true));

  dom.tableList.style.width = (dom.main.clientWidth - 20) * 6 + 'px';

  // create HTML elements for a table
  let firstTable = null;
  for (let moduleNo = 0; moduleNo < maxModule; moduleNo++) {
    let table = document.createElement('li');
    firstTable = firstTable ?? table;
    table.className = 'table tile';
    dom.periods[moduleNo] = timetable.create<HTMLLIElement>(null as any);

    for (let x = 0; x < timetable.daysofweek.length; x++) {
      let row = document.createElement('ul');
      row.className = 'row';

      for (let y = -1; y < timetable.maxTime; y++) {
        let item = document.createElement('li');
        if (y == -1) {
          item.innerHTML = timetable.daysofweek[x];
        }
        row.appendChild(item);
        dom.periods[moduleNo][x][y] = item;
      }
      table.appendChild(row);
    }
    dom.tableList.appendChild(table);
  }

  timetableWidth = (firstTable as HTMLLIElement).clientWidth;
  update();

  if (isMobile()) {
    switchDisplayTimetable(false);
  }

  const nowDate = new Date();
  const month = nowDate.getMonth() + 1;
  const date = nowDate.getDate();
  // academic calendar as of 2022
  // https://www.tsukuba.ac.jp/campuslife/calendar-school/pdf/2022-undergrad-grad-tsukuba.pdf
  const from = {
    springA: { month: 4, date: 1, index: 0 },
    springB: { month: 5, date: 25, index: 1 },
    springC: { month: 7, date: 6, index: 2 },
    autumnA: { month: 10, date: 1, index: 3 },
    authmnB: { month: 11, date: 11, index: 4 },
    authmnC: { month: 1, date: 6, index: 5 },
  };
  const sortedFromValues = Object.values(from).sort((a, b) => a.month - b.month);
  for (const term of sortedFromValues) {
    if (month > term.month || (month == term.month && date >= term.date)) {
      switchTimetable(term.index);
    }
  }
  setTimeout(() => (dom.tableList.style.transition = 'margin-left 0.5s ease'), 1);
};

export const update = () => {
  let credit = 0.0;
  let bookmarks = getBookmarks();
  timetable.disablePeriods.clear();

  // timetable
  for (let moduleNo = 0; moduleNo < maxModule; moduleNo++) {
    for (let time = 0; time < timetable.maxTime; time++) {
      for (let day = 0; day < timetable.daysofweek.length; day++) {
        let item = dom.periods[moduleNo][day][time];
        item.innerHTML = '';
        let no = 0;

        for (let code of bookmarks) {
          if (!(code in subjectMap)) {
            continue;
          }
          let subject = subjectMap[code];

          // term
          for (let subjectModuleNo in subject.termCodes) {
            if (!subject.termCodes[subjectModuleNo].includes(moduleNo)) {
              continue;
            }

            // period
            let startNo, endNo;
            [startNo, endNo] =
              subject.termCodes.length == subject.periodsArray.length
                ? [Number(subjectModuleNo), Number(subjectModuleNo)]
                : [0, subject.periodsArray.length - 1];

            for (let i = startNo; i <= endNo; i++) {
              let periods = subject.periodsArray[i];
              if (periods.get(day, time)) {
                // exclude from the timetable for search
                if (moduleNo == displayingModule) {
                  timetable.disablePeriods.set(day, time, true);
                }

                let syllabusLink = document.createElement('a');
                syllabusLink.href = subject.syllabusHref;

                const isInperson = subject.classMethods.includes('対面');
                const isOndemand = subject.classMethods.includes('オンデマンド');
                const isInteractive = subject.classMethods.includes('同時双方向');
                const isOnlyInPerson = isInperson && !isOndemand && !isInteractive;
                const isOnlyOnline = !isInperson && (isOndemand || isInteractive);
                const isCombinedInPersonOnline =
                  subject.classMethods.length > 0 && !isOnlyInPerson && !isOnlyOnline;
                // red with a class in person
                // blue with a online class
                // gray with others
                const baseH = isOnlyInPerson ? 320 : isCombinedInPersonOnline ? 260 : 200;
                const h = baseH + no * 5;
                const s =
                  isOnlyInPerson || isOnlyOnline || isCombinedInPersonOnline ? '100%' : '20%';

                let div = document.createElement('div');
                div.className = 'class';
                div.innerHTML = subject.name;
                div.style.margin = 0.1 * (no + 1) + 'rem';
                div.style.background = `hsl(${h}, ${s}, 90%, 0.8)`;
                item.appendChild(syllabusLink);
                syllabusLink.appendChild(div);
                no++;

                // remove button
                let remove = document.createElement('a');
                remove.classList.add('remove');
                remove.innerHTML = '×';
                div.appendChild(remove);

                div.addEventListener('mouseover', () => {
                  remove.classList.add('displayed');
                });
                div.addEventListener('mouseout', () => {
                  remove.classList.remove('displayed');
                });
                remove.addEventListener('click', () => {
                  removeBookmark(code);
                  changeBookmarkButton(code);

                  update();
                });
              }
            }
          }
        }
      }
    }
  }

  // credit
  for (let code of bookmarks) {
    if (code in subjectMap && !isNaN(subjectMap[code].credit)) {
      credit += Number(subjectMap[code].credit);
    }
  }

  // status
  let season = displayingModule < 3 ? '春' : '秋';
  let module_ = displayingModule % 3 == 0 ? 'A' : displayingModule % 3 == 1 ? 'B' : 'C';
  dom.module.innerHTML = season + module_;
  dom.credit.innerHTML = credit.toFixed(1) + '単位';
};
