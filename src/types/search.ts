
import {
    Campus,
    Semester,
    JikiKubun,
    Language
} from "../types/subject";

// TODO: 土、6,7コマを追加したことで「その他」の出番はなくなった
// TODO: subject/types.tsにもyoubiの定義がある！

export const youbis = ["月", "火", "水", "木", "金", "土"] as const;
export type Youbi = typeof youbis[number];

export const komas = [1, 2, 3, 4, 5, 6, 7] as const;
export type Koma = typeof komas[number];

export type YoubiKoma = `${Youbi}${Koma}` | SpecialSchedule;

export const specialSchedules = ["集中", "その他"] as const;
export type SpecialSchedule = typeof specialSchedules[number];

export type YoubiKomaSelected = {
    [key in YoubiKoma]: boolean;
};

export type BookmarkFilter = 'all' | 'bookmark' | 'except-bookmark'



export interface SearchOptions {
    campus: Campus | "その他" | "指定なし"
    subjectName: string
    teacher: string
    bookmarkFilter: BookmarkFilter
    kamokuKubun: string
    kaikouBukyoku: string
    youbiKoma: YoubiKomaSelected
    semester: Semester | "指定なし"
    jikiKubun: JikiKubun | "指定なし"
    courseType: "学部" | "大学院" | "指定なし"
    language: Language | "指定なし"
    rishuNenji: number | "指定なし"
    rishuNenjiFilter: "以下" | "のみ"
}
