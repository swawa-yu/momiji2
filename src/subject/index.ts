// import { Periods } from './period';

import subjectData from '../../subject-maininfo.json'

export interface kaisetsuki {
  rishuNenji: number
  semester: Semester
  jikiKubun: JikiKubun
}

export interface schedule {
  jikiKubun: JikiKubun
  jigen: string // TODO  集中　とかある　どうにかしたい
  room: string
}

// TODO 「解析エラー」としているが、他に適切な書き方がありそう
export const semesters = ['前期', '後期', '解析エラー'] as const;
export const jikiKubuns = ['１ターム', '２ターム', '３ターム', '４ターム', 'セメスター（前期）', 'セメスター（後期）', 'ターム外（前期）', 'ターム外（後期）', '年度', '通年', '集中', '解析エラー'] as const

export type Semester = typeof semesters[number];
export type JikiKubun = typeof jikiKubuns[number];

export type Subject = {
  [subjectProperty: string]: string
}

export type SubjectMap = { [subjectCode: string]: Subject }
// export const subjectMap: SubjectMap = {};
export const subjectMap: SubjectMap = {};
export const subjectCodeList = Object.keys(subjectMap);


// 何を表示するかここで決める
// export const propertyToShowList = ["講義コード", "開講部局", "開設期", "授業科目名", "単位", "教科書・参考書等"]
export const propertyToShowList: string[] = []

export const subjectProperties: string[] = []


// TODO 教員のリサーチマップ　https://researchmap.jp/researchers?q=名字+名前
// TODO お気に入り教員
// TODO 講義名をマウスホバーで講義の詳細を表示
// TODO setTimeout()ってなに

export const initializeSubject = () => {
  // export const initializeSubject = async () => {
  console.log("start initializeSubject()")
  // TODO パフォーマンスが向上するのかな？と思って、KDB式に代入をこんな風にしてるけど、これでええんか？
  const subjectMap_ = subjectData as unknown as SubjectMap;
  // const subjectMap_ = (await import('../../subjects.json')) as unknown as SubjectMap;

  Object.entries(subjectMap_).forEach(([key, value]) => {
    if (subjectCodeList.length < 1000) {

      // console.log(key, value)
      subjectMap[key] = value
      subjectCodeList.push(key)
    }
  })
  propertyToShowList.length = 0
  Object.keys(subjectMap["10000100"]).forEach((value) => {
    // if (propertyToShowList.length < 27)
    propertyToShowList.push(value)
  })
};

