// import { Periods } from './subject/period';

// export const daysofweek = ['月', '火', '水', '木', '金', '土', '日'];
// export const maxTime = 6;
// export let selectedPeriods: Periods;
// export let disablePeriods: Periods;

// export let dom: {
//   selectedPeriods: HTMLSpanElement;
//   display: HTMLAnchorElement;
//   timetable: HTMLDivElement;
//   content: HTMLDivElement;
//   periods: HTMLDivElement[][];
//   checkConcentration: HTMLInputElement;
//   checkNegotiable: HTMLInputElement;
//   checkAsNeeded: HTMLInputElement;
//   checkExcludeBookmark: HTMLInputElement;
// };


// export const create = <T>(filled: T): T[][] => {
//   const table = new Array(daysofweek.length);
//   for (let i in daysofweek) {
//     table[i] = new Array(maxTime).fill(filled);
//   }
//   return table;
// };

// export const display = () => {
//   let linkBounding = dom.display.getBoundingClientRect();
//   dom.timetable.style.top = window.pageYOffset + linkBounding.bottom + 10 + 'px';
//   dom.timetable.style.left = window.pageXOffset + linkBounding.left + 'px';
//   dom.timetable.style.display = 'block';
//   dom.selectedPeriods.innerHTML = 'カレンダーをクリックして曜日・時限を選択';
//   setTimeout(() => {
//     dom.timetable.style.opacity = '1';
//   }, 0);
// };


// const updateDOM = () => {
//   let text = '';
//   for (let day = 0; day < daysofweek.length; day++) {
//     let dayText = '';
//     for (let time = 0; time < maxTime; time++) {
//       dom.periods[day][time].classList.remove('disabled');
//       dom.periods[day][time].classList.remove('selected');
//       if (disablePeriods.get(day, time) && dom.checkExcludeBookmark.checked) {
//         dom.periods[day][time].classList.add('disabled');
//       } else if (selectedPeriods.get(day, time)) {
//         dom.periods[day][time].classList.add('selected');
//         dayText += Number(time) + 1;
//       }
//     }
//     if (dayText.length > 0) {
//       text += `<span class="day-label"><span class="day">${daysofweek[day]}</span>${dayText}</span>`;
//     }
//   }
//   text = text.length > 0 ? text : '指定なし';
//   if (window.matchMedia('screen and (max-width: 1100px)').matches) {
//     dom.display.innerHTML = text;
//   } else {
//     dom.selectedPeriods.innerHTML = text;
//   }
// };

// export const clear = () => {
//   for (let day = 0; day < daysofweek.length; day++) {
//     for (let time = 0; time < maxTime; time++) {
//       selectedPeriods.set(day, time, false);
//     }
//   }
//   dom.checkConcentration.checked = false;
//   dom.checkNegotiable.checked = false;
//   dom.checkAsNeeded.checked = false;
//   dom.checkExcludeBookmark.checked = false;
// };

// export const initialize = () => {
//   dom = {
//     selectedPeriods: document.getElementById('selected-periods') as HTMLSpanElement,
//     display: document.getElementById('display-timetable') as HTMLAnchorElement,
//     timetable: document.getElementById('timetable') as HTMLDivElement,
//     content: document.querySelector('#timetable .content') as HTMLDivElement,
//     periods: create<HTMLDivElement>(null as any),
//     checkConcentration: document.getElementById('check-concentration') as HTMLInputElement,
//     checkNegotiable: document.getElementById('check-negotiable') as HTMLInputElement,
//     checkAsNeeded: document.getElementById('check-asneeded') as HTMLInputElement,
//     checkExcludeBookmark: document.getElementById('check-exclude-bookmark') as HTMLInputElement,
//   };

//   selectedPeriods = new Periods();
//   selectedPeriods.onchanged = updateDOM;
//   disablePeriods = new Periods();
//   disablePeriods.onchanged = () => {
//     updateDOM();
//   };
//   dom.checkExcludeBookmark.addEventListener('click', updateDOM);

//   let beforeSelected: { x: number; y: number } | null = null;
//   let selectedMousePeriods: boolean[][] | null = null;

//   for (let y = 0; y <= maxTime; y++) {
//     let line = document.createElement('div');
//     line.classList.add('line');
//     dom.content.appendChild(line);

//     for (let x = -1; x < 7; x++) {
//       let item = document.createElement('div');
//       item.classList.add('item');
//       line.appendChild(item);

//       if (y > 0 && x == -1) {
//         item.innerHTML = y.toString();
//         item.classList.add('no');
//       } else if (y == 0 && x > -1) {
//         item.innerHTML = daysofweek[x];
//         item.classList.add('day');
//       } else if (y > 0 && x >= 0) {
//         dom.periods[x][y - 1] = item;
//         item.classList.add('period');

//         const changeSelectedPeriods = (x: number, y: number) => {
//           if (!beforeSelected) {
//             return;
//           }
//           for (let time = 0; time < maxTime; time++) {
//             for (let day = 0; day < daysofweek.length; day++) {
//               if (
//                 Math.min(x, beforeSelected.x) <= day &&
//                 day <= Math.max(x, beforeSelected.x) &&
//                 Math.min(y, beforeSelected.y) <= time + 1 &&
//                 time + 1 <= Math.max(y, beforeSelected.y) &&
//                 !(disablePeriods.get(day, time) && dom.checkExcludeBookmark.checked)
//               ) {
//                 selectedPeriods.set(day, time, !selectedMousePeriods![day][time]);
//               } else {
//                 selectedPeriods.set(day, time, selectedMousePeriods![day][time]);
//               }
//             }
//           }
//         };

//         const supportsTouch = 'ontouchend' in document;
//         item.addEventListener(
//           supportsTouch ? 'touchstart' : 'mousedown',
//           () => {
//             beforeSelected = { x: x, y: y };
//             selectedMousePeriods = JSON.parse(JSON.stringify(selectedPeriods.periods));
//             changeSelectedPeriods(x, y);
//           },
//           { passive: true }
//         );

//         item.addEventListener(supportsTouch ? 'touchmove' : 'mousemove', () => {
//           if (selectedMousePeriods) {
//             changeSelectedPeriods(x, y);
//           }
//         });

//         item.addEventListener(supportsTouch ? 'touchend' : 'mouseup', () => {
//           selectedMousePeriods = null;
//           beforeSelected = null;
//         });
//       }
//     }
//   }
// };
