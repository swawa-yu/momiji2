import { subjectCodeList, subjectMap } from "../subject";
import { Subject } from "../subject/types";
import { parseSchedule } from "../subject/parser";

// 検索条件で絞り込んだ科目のリスト(講義コードのリスト)を返す
export const filteredSubjectCodeList = (searchOptions: SearchOptions) => {
    return subjectCodeList.filter(
        (subjectCode: string) => matchesSearchOptions(subjectMap[subjectCode], searchOptions)
    );
}

export interface SearchOptions {
    campus: string;
    // keyword: string;
    // year: string;
    subjectName: string;
    teacher: string;
    bookmarkFilter: 'all' | 'bookmark' | 'except-bookmark';
    youbi: string;
    koma: string;
    // season: NormalSeasons | undefined;
    // module: Modules | undefined;
    // periods: Periods;
    // disablePeriods: Periods | null;
    // containsName: boolean;
    // containsCode: boolean;
    // containsRoom: boolean;
    // containsPerson: boolean;
    // containsAbstract: boolean;
    // containsNote: boolean;
    // filter: 'all' | 'bookmark' | 'except-bookmark';
    // concentration: boolean;
    // negotiable: boolean;
    // asneeded: boolean;
}

export function matchesSearchOptions(subject: Subject, searchOptions: SearchOptions): boolean {
    let machesCampus = searchOptions.campus === "" || subject["開講キャンパス"] === searchOptions.campus;
    let machesSubjectName = searchOptions.subjectName === "" || subject["授業科目名"].includes(searchOptions.subjectName);
    let machesTeacher = searchOptions.teacher === "" || subject["担当教員名"].includes(searchOptions.teacher);
    let machesYoubi = searchOptions.youbi === "" || subject["曜日・時限・講義室"].includes(searchOptions.youbi);
    const schedules = parseSchedule(subject["曜日・時限・講義室"]);
    let machesKoma = searchOptions.koma === "" ||
        schedules.some((schedule) => {
            return schedule.jigen?.komaRange[0] === "解析エラー" ? false :
                (schedule.jigen?.komaRange[0] as number) <= parseInt(searchOptions.koma) && parseInt(searchOptions.koma) <= (schedule.jigen?.komaRange[1] as number)
        });
    return machesCampus && machesSubjectName && machesTeacher && machesYoubi && machesKoma;
}
