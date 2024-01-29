
import { useContext } from 'react';
import { BookmarkContext } from '../contexts/BookmarkContext';
import { subjectCodeList, subject2Map } from "../subject";
import {
    Subject2,
    campuses,
    kaikouBukyokuGakubus, kaikouBukyokuDaigakuins, KaikouBukyokuGakubu, KaikouBukyokuDaigakuin,
    Language
} from "../types/subject";
import {
    YoubiKomaSelected,
    YoubiKoma,
    youbis,
    komas,
    specialSchedules,
    SearchOptions
} from "../types/search";


export const initializeYoubiKoma = (initialValue: boolean): YoubiKomaSelected => {
    const youbiKoma = {} as YoubiKomaSelected;

    youbis.forEach(youbi => {
        komas.forEach(koma => {
            youbiKoma[`${youbi}${koma}` as YoubiKoma] = initialValue;
        });
    });

    specialSchedules.forEach(special => {
        youbiKoma[special] = initialValue;
    });

    return youbiKoma;
};



export const initialSearchOptions: SearchOptions = {
    campus: "指定なし",
    bookmarkFilter: 'all',
    teacher: '',
    subjectName: '',
    kamokuKubun: '',
    kaikouBukyoku: '',
    youbiKoma: initializeYoubiKoma(true),
    semester: "指定なし",
    jikiKubun: "指定なし",
    courseType: "学部",
    language: "指定なし",
    rishuNenji: "指定なし",
    rishuNenjiFilter: "以下"
};

// 検索条件で絞り込んだ科目のリスト(講義コードのリスト)を返す
export const filterSubjectCodeList = (searchOptions: SearchOptions) => {
    return subjectCodeList.filter(subjectCode =>
        matchesSearchOptions(subject2Map[subjectCode], searchOptions)
    );
};


function matchesSearchOptions(subject: Subject2, searchOptions: SearchOptions): boolean {
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
        matchesLanguage(subject, searchOptions) &&
        matchesRishuNenji(subject, searchOptions);
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
    return searchOptions.teacher === "" || subject["担当教員名"].some(teacher => teacher.includes(searchOptions.teacher));
}

function matchesKamokuKubun(subject: Subject2, searchOptions: SearchOptions): boolean {
    return searchOptions.kamokuKubun === "" || subject["科目区分"].includes(searchOptions.kamokuKubun);
}

function matchesKaikouBukyoku(subject: Subject2, searchOptions: SearchOptions): boolean {
    return searchOptions.kaikouBukyoku === "" || subject["開講部局"].includes(searchOptions.kaikouBukyoku);
}

// searchOptions.youbiKomaのすべての要素について、チェックが入っている場合、次の判定をする
// 曜日が一致し、かつコマが範囲内にあるかどうかを調べ、あればtrueを返す
// 集中にチェックがある場合は集中であればtrueを返す
// その他にチェックがある場合は、「解析エラー or 月〜土の1~7コマでなくかつ集中でない」であればtrueを返す(そんな科目があるのかは不明だが、表示されない科目があると困るので)
//   (2024-01-28: その他に該当する科目は現在ないので、この部分のロジックは意味ないです。)
// 集中講義かどうかの判定は？(時期区分が集中でなくとも、schedule.jigenがundefinedのことがある。...「(3T) 集中：担当教員の指定による」みたいなパターン)
//   時期区分だけでなく、曜日の集中も集中講義判定とする
function matchesYoubiKoma(subject: Subject2, searchOptions: SearchOptions): boolean {
    const schedules = subject["授業時間・講義室"];

    const matchesYoubiKoma =
        youbis.some(youbi => {
            return komas.some(koma => {
                return searchOptions.youbiKoma[`${youbi}${koma}`] === true &&
                    schedules.some((schedule) => {
                        return (schedule.jigen?.youbi as string) === (youbi as string) &&
                            (schedule.jigen?.komaRange?.begin as number) <= koma && koma <= (schedule.jigen?.komaRange?.last as number)
                    })
            })
        }) ||
        (searchOptions.youbiKoma["集中"] === true && schedules.some((schedule) => {
            return schedule.jikiKubun === "集中" ||
                schedule.jigen === undefined    // 「時期区分だけでなく、曜日の集中も集中講義判定とする」の部分
        })) ||
        (searchOptions.youbiKoma["その他"] === true && schedules.some((schedule) => {
            return schedule.jikiKubun === undefined ||
                !youbis.some(youbi => {
                    return komas.some(koma => {
                        return schedules.some((schedule) => {
                            return (schedule.jigen?.youbi as string) === (youbi as string) &&
                                (schedule.jigen?.komaRange?.begin as number) <= koma && koma <= (schedule.jigen?.komaRange?.last as number)
                        })
                    })
                }) && !(schedule.jikiKubun === "集中" || schedule.jigen === undefined)
        }));
    return matchesYoubiKoma;
}

function matchesBookmark(subject: Subject2, searchOptions: SearchOptions): boolean {
    const bookmarkedSubjects = useContext(BookmarkContext).bookmarkedSubjects;
    return searchOptions.bookmarkFilter === "all" ||
        searchOptions.bookmarkFilter === "bookmark" && bookmarkedSubjects.has(subject["講義コード"]) ||
        searchOptions.bookmarkFilter === "except-bookmark" && !bookmarkedSubjects.has(subject["講義コード"]);
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

function matchesRishuNenji(subject: Subject2, searchOptions: SearchOptions): boolean {
    return searchOptions.rishuNenji === "指定なし" ||
        searchOptions.rishuNenjiFilter === "以下" && subject["履修年次"] <= searchOptions.rishuNenji ||
        searchOptions.rishuNenjiFilter === "のみ" && subject["履修年次"] == searchOptions.rishuNenji;
}
