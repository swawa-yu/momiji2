// import { Periods } from './period';

// 全授業の主要情報の辞書
import subjectData from '../../data/subject-maininfo.json'

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
  jigen: Jigen | undefined // TODO: 集中講義の場合はundefined でよいのか？　Jigen["youbi"]に"集中"を入れるべきか？
  room: string  // 何も書かれていない場合は空文字列
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

export type SubjectMap = { [subjectCode: string]: Subject }
export const subjectMap: SubjectMap = {};
export const subjectCodeList = Object.keys(subjectMap);


// 何を表示するかここで決める
// export const propertyToShowList = ["講義コード", "開講部局", "開設期", "授業科目名", "単位", "教科書・参考書等"]
// ※今は便宜的にすべてのプロパティを表示するためにinitializeSubject()内で初期化している。
export const propertyToShowList: string[] = []

export const subjectProperties: string[] = []


// TODO 教員のリサーチマップ　https://researchmap.jp/researchers?q=名字+名前
// TODO お気に入り教員
// TODO 講義名をマウスホバーで講義の詳細を表示
// TODO setTimeout()ってなに, async await って使ったほうがいいの？

export const initializeSubject = () => {

  // 表示する授業を記憶しておく配列とかを空にする
  Object.keys(subjectMap).forEach((key) => {
    delete subjectMap[key]
  })
  subjectCodeList.length = 0
  propertyToShowList.length = 0

  // 授業データの読み込み
  const subjectMap_ = subjectData as unknown as SubjectMap;

  // 表示する授業を記憶しておく配列とかに値を設定する
  Object.entries(subjectMap_).forEach(([key, value]) => {
    subjectMap[key] = value
    subjectCodeList.push(key)
  })

  // 便宜的に、すべてのプロパティを表示することにしている。そのためのループ。本来は変数定義時に決定する。
  // propertyToShowList = Object.keys(subjectMap["10000100"]);
  Object.keys(subjectMap["10000100"]).forEach((value) => {
    // if (propertyToShowList.length < 27)
    propertyToShowList.push(value)
  })
};

