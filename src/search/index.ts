import { subjectCodeList, subjectMap } from "../subject";
import { Subject, Campus, campuses } from "../subject/types";
import { parseSchedule } from "../subject/parser";
import { YoubiKomaSelected, youbis, komas } from "./KomaSelector";

export type BookmarkFilter = 'all' | 'bookmark' | 'except-bookmark'

// TODO: bookmarkedSubjectsはここにあるべきか？
export interface SearchOptions {
    campus: Campus | "その他" | "指定なし"
    // keyword: string;
    // year: string;
    subjectName: string
    teacher: string
    bookmarkFilter: BookmarkFilter
    kamokuKubun: string
    kaikouBukyoku: string
    youbiKoma: YoubiKomaSelected
    bookmarkedSubjects: Set<string>
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

// 検索条件で絞り込んだ科目のリスト(講義コードのリスト)を返す
export const filteredSubjectCodeList = (searchOptions: SearchOptions) => {
    // console.log("start filtering");
    // console.log(searchOptions.bookmarkedSubjects);
    // if (searchOptions.youbiKoma["集中"] === true) {
    //     console.log("集中 is checked");
    // }
    const res = subjectCodeList.filter(
        (subjectCode: string) => matchesSearchOptions(subjectMap[subjectCode], searchOptions)
    );
    // console.log("finish filtering");
    return res
}


function matchesCampus(subject: Subject, searchOptions: SearchOptions): boolean {
    return searchOptions.campus === "指定なし" ||
        subject["開講キャンパス"] === searchOptions.campus ||
        searchOptions.campus === "その他" && !(campuses.includes(subject["開講キャンパス"]));
}

function matchesSubjectName(subject: Subject, searchOptions: SearchOptions): boolean {
    return searchOptions.subjectName === "" || subject["授業科目名"].includes(searchOptions.subjectName);
}

function matchesTeacher(subject: Subject, searchOptions: SearchOptions): boolean {
    return searchOptions.teacher === "" || subject["担当教員名"].includes(searchOptions.teacher);
}

function matchesKamokuKubun(subject: Subject, searchOptions: SearchOptions): boolean {
    return searchOptions.kamokuKubun === "" || subject["科目区分"].includes(searchOptions.kamokuKubun);
}

function matchesKaikouBukyoku(subject: Subject, searchOptions: SearchOptions): boolean {
    return searchOptions.kaikouBukyoku === "" || subject["開講部局"].includes(searchOptions.kaikouBukyoku);
}

// searchOptions.youbiKomaのすべての要素について、チェックが入っている場合、次の判定をする
// 曜日が一致しかつコマが範囲内にあるかどうかを調べ、あればtrueを返す
// 集中の場合は集中であればtrueを返す
// その他の場合は、解析エラーか、月〜金の1~5コマでなくかつ集中でなければtrueを返す
// 集中講義かどうかの判定は？(時期区分が集中でなくとも、schedule.jigenがundefinedのことがある。...「(3T) 集中：担当教員の指定による」みたいなパターン)
function matchesYoubiKoma(subject: Subject, searchOptions: SearchOptions): boolean {
    const schedules = parseSchedule(subject["曜日・時限・講義室"]);

    // searchOptions.youbiKomaのすべての要素について、チェックが入っている場合、次の判定をする
    // 曜日が一致しかつコマが範囲内にあるかどうかを調べ、あればtrueを返す
    // 集中の場合は集中であればtrueを返す
    // その他の場合は、解析エラーか、月〜金の1~5コマでなくかつ集中でなければtrueを返す
    // 集中講義かどうかの判定は？(時期区分が集中でなくとも、schedule.jigenがundefinedのことがある。...「(3T) 集中：担当教員の指定による」みたいなパターン)
    //   時期区分だけでなく、曜日の集中も集中講義判定とする
    const matchesYoubiKoma =
        youbis.some(youbi => {
            return komas.some(koma => {
                return searchOptions.youbiKoma[`${youbi}${koma}`] === true &&
                    schedules.some((schedule) => {
                        return (schedule.jigen?.youbi as string) === (youbi as string) &&
                            (schedule.jigen?.komaRange[0] as number) <= koma && koma <= (schedule.jigen?.komaRange[1] as number)
                    })
            })
        }) ||
        (searchOptions.youbiKoma["集中"] === true && schedules.some((schedule) => {
            return schedule.jikiKubun === "集中" ||
                schedule.jigen === undefined
        })) ||
        (searchOptions.youbiKoma["その他"] === true && schedules.some((schedule) => {
            return schedule.jikiKubun === "解析エラー" ||
                !youbis.some(youbi => {
                    return komas.some(koma => {
                        return schedules.some((schedule) => {
                            return (schedule.jigen?.youbi as string) === (youbi as string) &&
                                (schedule.jigen?.komaRange[0] as number) <= koma && koma <= (schedule.jigen?.komaRange[1] as number)
                        }
                        )
                    }
                    )
                }
                ) && !(schedule.jikiKubun === "集中" || schedule.jigen === undefined)
        }
        )
        );
    return matchesYoubiKoma;
}

function matchesBookmark(subject: Subject, searchOptions: SearchOptions): boolean {
    return searchOptions.bookmarkFilter === "all" ||
        // searchOptions.bookmarkFilter === "bookmark" ||
        searchOptions.bookmarkFilter === "bookmark" && searchOptions.bookmarkedSubjects.has(subject["講義コード"]) ||
        searchOptions.bookmarkFilter === "except-bookmark" && !searchOptions.bookmarkedSubjects.has(subject["講義コード"]);
}

// TODO: すべての要素を調べるのは効率が悪いので改善したい
export function matchesSearchOptions(subject: Subject, searchOptions: SearchOptions): boolean {
    return matchesCampus(subject, searchOptions) &&
        matchesSubjectName(subject, searchOptions) &&
        matchesTeacher(subject, searchOptions) &&
        matchesKamokuKubun(subject, searchOptions) &&
        matchesKaikouBukyoku(subject, searchOptions) &&
        matchesYoubiKoma(subject, searchOptions) &&
        matchesBookmark(subject, searchOptions);
}
