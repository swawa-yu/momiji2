import { subjectCodeList, subjectMap } from "../subject";
import { Subject, Campus, campuses } from "../subject/types";
import { parseSchedule } from "../subject/parser";

export interface SearchOptions {
    campus: Campus | "その他" | "指定なし"
    // keyword: string;
    // year: string;
    subjectName: string
    teacher: string
    bookmarkFilter: 'all' | 'bookmark' | 'except-bookmark'
    youbi: string
    koma: string
    kamokuKubun: string
    kaikouBukyoku: string
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

// TODO: すべての要素を調べるのは効率が悪いので改善したい
// filterを繰り返したほうが速そう
// 検索条件で絞り込んだ科目のリスト(講義コードのリスト)を返す
export const filteredSubjectCodeList = (searchOptions: SearchOptions) => {
    return subjectCodeList.filter(
        (subjectCode: string) => matchesSearchOptions(subjectMap[subjectCode], searchOptions)
    );
}

// TODO: すべての要素を調べるのは効率が悪いので改善したい
export function matchesSearchOptions(subject: Subject, searchOptions: SearchOptions): boolean {
    const machesCampus =
        searchOptions.campus === "指定なし" ||
        subject["開講キャンパス"] === searchOptions.campus ||
        searchOptions.campus === "その他" && !(campuses.includes(subject["開講キャンパス"]));
    const machesSubjectName = searchOptions.subjectName === "" || subject["授業科目名"].includes(searchOptions.subjectName);
    const machesTeacher = searchOptions.teacher === "" || subject["担当教員名"].includes(searchOptions.teacher);
    const machesYoubi = searchOptions.youbi === "" || subject["曜日・時限・講義室"].includes(searchOptions.youbi);
    const schedules = parseSchedule(subject["曜日・時限・講義室"]);
    const machesKoma = searchOptions.koma === "" ||
        schedules.some((schedule) => {
            return schedule.jigen?.komaRange[0] === "解析エラー" ? false :
                (schedule.jigen?.komaRange[0] as number) <= parseInt(searchOptions.koma) && parseInt(searchOptions.koma) <= (schedule.jigen?.komaRange[1] as number)
        });
    const matchesKamokuKubun = searchOptions.kamokuKubun === "" || subject["科目区分"].includes(searchOptions.kamokuKubun);
    const matchesKaikouBukyoku = searchOptions.kaikouBukyoku === "" || subject["開講部局"].includes(searchOptions.kaikouBukyoku);
    return machesCampus && machesSubjectName && machesTeacher && machesYoubi && machesKoma && matchesKamokuKubun && matchesKaikouBukyoku;
}
