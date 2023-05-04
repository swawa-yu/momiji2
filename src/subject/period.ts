import * as timetable from '../timetable';

export class Periods {
  private _periods: boolean[][];
  private clickHandler: (() => void) | null = null;

  constructor(value?: any) {
    this._periods = timetable.create(false);
    let dayArray: number[] = [];

    if (value != null && typeof value == 'string') {
      let periodStrArray = (value as string).split(',');
      for (let periodStr of periodStrArray) {
        let dayStr = periodStr.replace(/[0-9\\-]/g, '');
        let days = dayStr
          .split('・')
          .filter((day) => timetable.daysofweek.includes(day))
          .map((day) => timetable.daysofweek.indexOf(day));
        if (days.length > 0) {
          dayArray = days;
        }
        let timeArray = [];
        let timeStr = periodStr.replace(/[^0-9\\-]/g, '');

        if (timeStr.indexOf('-') > -1) {
          let timeStrArray = timeStr.split('-');
          let startTime = Number(timeStrArray[0]);
          let endTime = Number(timeStrArray[1]);
          for (let k = startTime; k <= endTime; k++) {
            timeArray.push(k);
          }
        } else {
          timeArray.push(Number(timeStr));
        }

        if (timeStr.length > 0) {
          for (let day of dayArray) {
            for (let time of timeArray) {
              this._periods[day][time - 1] = true;
            }
          }
        }
      }
    }
  }

  set onchanged(clickHandler: () => void) {
    this.clickHandler = clickHandler;
  }

  get length() {
    return this._periods.reduce(
      (accumulator, day) => day.reduce((sum, time) => (time ? 1 : 0) + sum, 0) + accumulator,
      0
    );
  }

  get periods() {
    return this._periods;
  }

  clear() {
    for (const day in this._periods) {
      for (const time in this._periods[day]) {
        this._periods[day][time] = false;
      }
    }
    if (this.clickHandler != null) {
      this.clickHandler();
    }
  }

  set(day: number, time: number, state: boolean) {
    this._periods[day][time] = state;
    if (this.clickHandler != null) {
      this.clickHandler();
    }
  }

  get(day: number, time: number) {
    return this._periods[day][time];
  }

  matches(periods: Periods) {
    for (let day in this._periods) {
      for (let time in this._periods[day]) {
        if (this._periods[day][time] && periods._periods[day][time]) {
          return true;
        }
      }
    }
    return false;
  }
}
