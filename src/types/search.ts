
import {
    Campus,
    Semester,
    JikiKubun,
    Language,
    YoubiKoma,
    KamokuKubun,
    KaikouBukyoku,
} from "../types/subject";


export type YoubiKomaSelected = {
    [key in YoubiKoma]: boolean;
};

export type BookmarkFilter = 'all' | 'bookmark' | 'except-bookmark'



export interface SearchOptions {
    campus: Campus | "その他" | "指定なし"
    subjectName: string
    teacher: string
    bookmarkFilter: BookmarkFilter
    kamokuKubun: KamokuKubun | "指定なし"
    kaikouBukyoku: KaikouBukyoku | "指定なし"
    youbiKoma: YoubiKomaSelected
    semester: Semester | "指定なし"
    jikiKubun: JikiKubun | "指定なし"
    courseType: "学部" | "大学院" | "指定なし"
    language: Language | "指定なし"
    rishuNenji: number | "指定なし"
    rishuNenjiFilter: "以下" | "のみ"
    subjectCode: string
}
