import { getBookmarks } from '../bookmark';
import type { Modules, NormalSeasons, Subject } from '.';
import { getTermCode } from '.';
import { Periods } from './period';

export interface SearchOptions {
  keyword: string;
  reqA: string;
  reqB: string;
  reqC: string;
  online: string;
  year: string;
  season: NormalSeasons | undefined;
  module: Modules | undefined;
  periods: Periods;
  disablePeriods: Periods | null;
  containsName: boolean;
  containsCode: boolean;
  containsRoom: boolean;
  containsPerson: boolean;
  containsAbstract: boolean;
  containsNote: boolean;
  filter: 'all' | 'bookmark' | 'except-bookmark';
  concentration: boolean;
  negotiable: boolean;
  asneeded: boolean;
}

export function matchesSearchOptions(subject: Subject, options: SearchOptions): boolean {
  // keyword
  const regex = new RegExp(options.keyword, 'i');
  const matchesCode = options.containsCode && subject.code.indexOf(options.keyword) > -1;
  const matchesName = options.containsName && subject.name.match(regex) != null;
  const matchesRoom = options.containsRoom && subject.room.match(regex) != null;
  const matchesPerson = options.containsPerson && subject.person.match(regex) != null;
  const matchesAbstract = options.containsAbstract && subject.abstract.match(regex) != null;
  const matchesNote = options.containsNote && subject.note.match(regex) != null;
  const matchesKeyword =
    (!options.containsCode &&
      !options.containsName &&
      !options.containsRoom &&
      !options.containsPerson &&
      !options.containsAbstract) ||
    matchesCode ||
    matchesName ||
    matchesRoom ||
    matchesPerson ||
    matchesAbstract ||
    matchesNote;

  // period
  let matchesPeriods =
    !(
      options.disablePeriods != null &&
      subject.periodsArray.some((periods) => periods.matches(options.disablePeriods!), false)
    ) &&
    (options.periods.length == 0 ||
      subject.periodsArray.some((periods) => periods.matches(options.periods), false) ||
      (options.concentration && subject.concentration) ||
      (options.negotiable && subject.negotiable) ||
      (options.asneeded && subject.asneeded));

  // standard year of course
  let matchesYear;
  if (options.year == 'null') {
    matchesYear = true;
  } else if (subject.year.indexOf('-') == -1) {
    matchesYear = subject.year.indexOf(options.year) > -1;
  } else {
    let minYear = subject.year.replace(/\s-\s[1-6]/g, '');
    let maxYear = subject.year.replace(/[1-6]\s-\s/g, '');
    matchesYear = minYear <= options.year && options.year <= maxYear;
  }

  // requirements
  let matchesReqA = options.reqA == 'null' || options.reqA == subject.reqA;
  let matchesReqB = options.reqB == 'null' || options.reqB == subject.reqB;
  let matchesReqC = options.reqC == 'null' || options.reqC == subject.reqC;

  // term
  let matchesSeason = options.season == null || subject.termStr.indexOf(options.season) > -1;
  let matchesModule = options.module == null || subject.termStr.indexOf(options.module) > -1;
  let matchesTerm =
    options.season && options.module
      ? subject.termCodes.some((codes) =>
          codes.includes(getTermCode(options.season!, options.module!))
        )
      : matchesSeason && matchesModule;

  // other options
  const bookmarked = getBookmarks().includes(subject.code);
  const matchesOnline = options.online == 'null' || subject.note.indexOf(options.online) > -1;
  const matchesBookmark =
    options.filter == 'all' ||
    (options.filter == 'bookmark' && bookmarked) ||
    (options.filter == 'except-bookmark' && !bookmarked);

  return (
    matchesKeyword &&
    matchesPeriods &&
    matchesYear &&
    matchesReqA &&
    matchesReqB &&
    matchesReqC &&
    matchesTerm &&
    matchesOnline &&
    matchesBookmark
  );
}
