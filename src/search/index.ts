import { subjectCodeList, subject2Map } from "../subject";
import {
    Subject2,
    Campus, campuses,
    Semester,
    JikiKubun,
    kaikouBukyokuGakubus, kaikouBukyokuDaigakuins, KaikouBukyokuGakubu, KaikouBukyokuDaigakuin,
    Language
} from "../subject/types";
import { YoubiKomaSelected, youbis, komas } from "./KomaSelector";

export type BookmarkFilter = 'all' | 'bookmark' | 'except-bookmark'

// TODO: bookmarkedSubjectsはここにあるべきか？
export interface SearchOptions {
    campus: Campus | "その他" | "指定なし"
    subjectName: string
    teacher: string
    bookmarkFilter: BookmarkFilter
    kamokuKubun: string
    kaikouBukyoku: string
    youbiKoma: YoubiKomaSelected
    bookmarkedSubjects: Set<string>
    semester: Semester | "指定なし"
    jikiKubun: JikiKubun | "指定なし"
    courseType: "学部" | "大学院" | "指定なし"
    language: Language | "指定なし"
}

// 検索条件で絞り込んだ科目のリスト(講義コードのリスト)を返す
export const filterSubjectCodeList = (searchOptions: SearchOptions) => {
    const res = subjectCodeList.filter(
        subjectCode => matchesSearchOptions(subject2Map[subjectCode], searchOptions)
    );
    return res
}


function matchesCampus(subject: Subject2, searchOptions: SearchOptions): boolean {
    return searchOptions.campus === "指定なし" ||
        subject["開講キャンパス"] === searchOptions.campus ||
        searchOptions.campus === "その他" && !(campuses.includes(subject["開講キャンパス"]));
}

function matchesSubjectName(subject: Subject2, searchOptions: SearchOptions): boolean {
    return searchOptions.subjectName === "" || subject["授業科目名"].includes(searchOptions.subjectName);
}

function matchesTeacher(subject: Subject2, searchOptions: SearchOptions): boolean {
    return searchOptions.teacher === "" || subject["担当教員名"].includes(searchOptions.teacher);
}

function matchesKamokuKubun(subject: Subject2, searchOptions: SearchOptions): boolean {
    return searchOptions.kamokuKubun === "" || subject["科目区分"].includes(searchOptions.kamokuKubun);
}

function matchesKaikouBukyoku(subject: Subject2, searchOptions: SearchOptions): boolean {
    return searchOptions.kaikouBukyoku === "" || subject["開講部局"].includes(searchOptions.kaikouBukyoku);
}

// searchOptions.youbiKomaのすべての要素について、チェックが入っている場合、次の判定をする
// 曜日が一致しかつコマが範囲内にあるかどうかを調べ、あればtrueを返す
// 集中の場合は集中であればtrueを返す
// その他の場合は、解析エラーか、月〜金の1~5コマでなくかつ集中でなければtrueを返す
// 集中講義かどうかの判定は？(時期区分が集中でなくとも、schedule.jigenがundefinedのことがある。...「(3T) 集中：担当教員の指定による」みたいなパターン)
function matchesYoubiKoma(subject: Subject2, searchOptions: SearchOptions): boolean {
    const schedules = subject["授業時間・講義室"];

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
                        })
                    })
                }) && !(schedule.jikiKubun === "集中" || schedule.jigen === undefined)
        }));
    return matchesYoubiKoma;
}

function matchesBookmark(subject: Subject2, searchOptions: SearchOptions): boolean {
    return searchOptions.bookmarkFilter === "all" ||
        searchOptions.bookmarkFilter === "bookmark" && searchOptions.bookmarkedSubjects.has(subject["講義コード"]) ||
        searchOptions.bookmarkFilter === "except-bookmark" && !searchOptions.bookmarkedSubjects.has(subject["講義コード"]);
}

function matchesSemester(subject: Subject2, searchOptions: SearchOptions): boolean {
    const semester = subject["セメスター"];
    return searchOptions.semester === "指定なし" ||
        semester === searchOptions.semester;
}

function matchesJikiKubun(subject: Subject2, searchOptions: SearchOptions): boolean {
    const jikiKubun = subject["時期区分"];
    return searchOptions.jikiKubun === "指定なし" ||
        jikiKubun === searchOptions.jikiKubun;
}

function matchesCourseType(subject: Subject2, searchOptions: SearchOptions): boolean {
    return searchOptions.courseType === "指定なし" ||
        (searchOptions.courseType === "学部" && kaikouBukyokuGakubus.includes(subject["開講部局"] as KaikouBukyokuGakubu)) ||
        (searchOptions.courseType === "大学院" && kaikouBukyokuDaigakuins.includes(subject["開講部局"] as KaikouBukyokuDaigakuin));
}

function matchesLanguage(subject: Subject2, searchOptions: SearchOptions): boolean {
    return searchOptions.language === "指定なし" ||
        subject["使用言語"] as Language === searchOptions.language;
}

// TODO: すべての要素を調べるのは効率が悪いので改善したい
export function matchesSearchOptions(subject: Subject2, searchOptions: SearchOptions): boolean {
    return matchesCampus(subject, searchOptions) &&
        matchesSubjectName(subject, searchOptions) &&
        matchesTeacher(subject, searchOptions) &&
        matchesKamokuKubun(subject, searchOptions) &&
        matchesSemester(subject, searchOptions) &&
        matchesJikiKubun(subject, searchOptions) &&
        matchesKaikouBukyoku(subject, searchOptions) &&
        matchesYoubiKoma(subject, searchOptions) &&
        matchesBookmark(subject, searchOptions) &&
        matchesCourseType(subject, searchOptions) &&
        matchesLanguage(subject, searchOptions);
}
