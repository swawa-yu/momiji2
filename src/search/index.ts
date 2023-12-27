import { subjectCodeList, subjectMap } from "../subject";
import { Subject, Campus, campuses } from "../subject/types";
import { parseSchedule } from "../subject/parser";
import { YoubiKomaSelected, extractYoubiAndKoma, youbis, komas, YoubiKoma, youbiKomaKeys } from "./KomaSelector";

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
    youbiKoma: YoubiKomaSelected
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
// TODO: コマの検索の実装が酷いので修正が必要
export const filteredSubjectCodeList = (searchOptions: SearchOptions) => {
    console.log("start filtering");
    if (searchOptions.youbiKoma["集中"] === true) {
        console.log("集中 is checked");
    }
    const res = subjectCodeList.filter(
        (subjectCode: string) => matchesSearchOptions(subjectMap[subjectCode], searchOptions)
    );
    console.log("finish filtering");
    return res
}

// TODO: すべての要素を調べるのは効率が悪いので改善したい
export function matchesSearchOptions(subject: Subject, searchOptions: SearchOptions): boolean {
    const schedules = parseSchedule(subject["曜日・時限・講義室"]);

    const machesCampus =
        searchOptions.campus === "指定なし" ||
        subject["開講キャンパス"] === searchOptions.campus ||
        searchOptions.campus === "その他" && !(campuses.includes(subject["開講キャンパス"]));
    const machesSubjectName = searchOptions.subjectName === "" || subject["授業科目名"].includes(searchOptions.subjectName);
    const machesTeacher = searchOptions.teacher === "" || subject["担当教員名"].includes(searchOptions.teacher);
    const machesYoubi = searchOptions.youbi === "" || subject["曜日・時限・講義室"].includes(searchOptions.youbi);
    const machesKoma = searchOptions.koma === "" ||
        schedules.some((schedule) => {
            return schedule.jigen?.komaRange[0] === "解析エラー" ? false :
                (schedule.jigen?.komaRange[0] as number) <= parseInt(searchOptions.koma) && parseInt(searchOptions.koma) <= (schedule.jigen?.komaRange[1] as number)
        });
    const matchesKamokuKubun = searchOptions.kamokuKubun === "" || subject["科目区分"].includes(searchOptions.kamokuKubun);
    const matchesKaikouBukyoku = searchOptions.kaikouBukyoku === "" || subject["開講部局"].includes(searchOptions.kaikouBukyoku);

    // searchOptions.youbiKomaのすべての要素について、チェックが入っている場合、次の判定をする
    // 曜日が一致しかつコマが範囲内にあるかどうかを調べ、あればtrueを返す
    // 集中の場合は集中であればtrueを返す
    // その他の場合は、解析エラーか、月〜金の1~5コマでなくかつ集中でなければtrueを返す
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
            return schedule.jigen === undefined
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
                }) && schedule.jikiKubun !== "集中"
        }));
    return machesCampus && machesSubjectName && machesTeacher && machesYoubi && machesKoma && matchesKamokuKubun && matchesKaikouBukyoku && matchesYoubiKoma;
}
