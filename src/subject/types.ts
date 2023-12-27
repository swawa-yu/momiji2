export interface Kaisetsuki {
    rishuNenji: number
    semester: Semester
    jikiKubun: JikiKubun
}

// TODO 命名が最悪すぎる　「jigen」ってなんだ
export interface Jigen {
    youbi: "月" | "火" | "水" | "木" | "金" | "土" | "解析エラー"
    jigenRange: [begin: number, last: number] | "解析エラー"
    komaRange: [begin: number, last: number] | "解析エラー"
}


export interface Schedule {
    jikiKubun: JikiKubun  // 1ターム、2ターム、3ターム、4ターム、セメスター（前期）、セメスター（後期）、ターム外（前期）、ターム外（後期）、年度、通年、集中
    jigen: Jigen | undefined // 集中講義の場合はundefined // TODO: でよいのか？("集中"とする方法)
    rooms: string[]  // 何も書かれていない場合は空文字列, // TODO 本当は[string]のほうが良さそう
}

// TODO 「解析エラー」としているが、他に適切な書き方がありそう
export const semesters = ['前期', '後期', '解析エラー'] as const;
export const jikiKubuns = ['１ターム', '２ターム', '３ターム', '４ターム', 'セメスター（前期）', 'セメスター（後期）', 'ターム外（前期）', 'ターム外（後期）', '年度', '通年', '集中', '解析エラー'] as const

export type Semester = typeof semesters[number];
export type JikiKubun = typeof jikiKubuns[number];

export type SubjectProperty =
    "relative URL" |
    "年度" |
    "開講部局" |
    "講義コード" |
    "科目区分" |
    "授業科目名" |
    "担当教員名" |
    "開講キャンパス" |
    "開設期" |
    "曜日・時限・講義室" |
    "単位" |
    "使用言語" |
    "教科書・参考書等" |
    "対象学生" |
    "授業の目標・概要等" |
    "予習・復習への アドバイス" |
    "履修上の注意 受講条件等	メッセージ" |
    "メッセージ" |
    "その他"


export type Subject = { [key in SubjectProperty]: string }

export type Subject2 = {
    "relative URL": string,
    "年度": string,
    "開講部局": string,
    "講義コード": string,
    "科目区分": string,
    "授業科目名": string,
    "担当教員名": [string],
    "開講キャンパス": string,
    "開設期": string,
    "セメスター": Semester,
    "時期区分": JikiKubun,
    "履修年次": number,
    "授業時間": [Schedule],
    "曜日・時限・講義室": string,
    "単位": string,
    "使用言語": string,
    "教科書・参考書等": string,
    "対象学生": string,
    "授業の目標・概要等": string,
    "予習・復習への アドバイス": string,
    "履修上の注意 受講条件等	メッセージ": string,
    "メッセージ": string,
    "その他": string
}


export type SubjectMap = { [subjectCode: string]: Subject }