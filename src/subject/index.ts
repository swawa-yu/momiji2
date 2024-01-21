// import { Periods } from './period';
import { SubjectMap, Subject, Subject2, KaikouBukyoku, KamokuKubun, Language } from './types';

// 全授業の主要情報の辞書
import subjectData from '../../data/subject-maininfo.json'
import { parseKaisetsuki, parseSchedule } from './utils';


export const subjectMap: SubjectMap = {};
export const subject2Map: { [subjectCode: string]: Subject2 } = {};
export const subjectCodeList = Object.keys(subjectMap);


// 何を表示するかここで決める
// export const propertyToShowList = ["講義コード", "開講部局", "開設期", "授業科目名", "単位", "教科書・参考書等"]
// ※今は便宜的にすべてのプロパティを表示するためにinitializeSubject()内で初期化している。
export const propertyToShowList: string[] = []

export const subjectProperties: string[] = []



// TODO お気に入り教員
// TODO 講義名をマウスホバーで講義の詳細を表示
// TODO setTimeout()ってなに, async await って使ったほうがいいの？

export const initializeSubject = () => {

  // subjectMap, subjectCodeList, propertyToShowListの初期化
  Object.keys(subjectMap).forEach((key) => {
    delete subjectMap[key]
  })
  subjectCodeList.length = 0
  propertyToShowList.length = 0

  // subjectMap, subjectCodeListの初期化
  // 授業データの読み込み
  const subjectMap_ = subjectData as unknown as SubjectMap;

  // 表示する授業を記憶しておく配列とかに値を設定する
  Object.entries(subjectMap_).forEach(([subjectCode, subject]) => {
    subjectMap[subjectCode] = subject as Subject
    subjectCodeList.push(subjectCode)
  })

  Object.entries(subjectMap).forEach(([subjectCode, subject]) => {
    const { rishuNenji, semester, jikiKubun } = parseKaisetsuki(subject["開設期"]);
    const schedules = parseSchedule(subject["曜日・時限・講義室"]);
    subject2Map[subjectCode] = {
      "relative URL": subject["relative URL"],
      "年度": subject["年度"],
      "開講部局": subject["開講部局"] as KaikouBukyoku,
      "講義コード": subject["講義コード"],
      "科目区分": subject["科目区分"] as KamokuKubun,
      "授業科目名": subject["授業科目名"],
      "担当教員名": subject["担当教員名"].split(",").filter((s) => s !== "null"),
      "開講キャンパス": subject["開講キャンパス"],
      "セメスター": semester,
      "時期区分": jikiKubun,
      "履修年次": rishuNenji,
      "授業時間・講義室": schedules,
      "開設期": subject["開設期"],
      "曜日・時限・講義室": subject["曜日・時限・講義室"],
      "単位": subject["単位"],
      "使用言語": subject["使用言語"] as Language,
      "教科書・参考書等": subject["教科書・参考書等"],
      "対象学生": subject["対象学生"],
      "授業の目標・概要等": subject["授業の目標・概要等"],
      "予習・復習への アドバイス": subject["予習・復習への アドバイス"],
      "履修上の注意 受講条件等	メッセージ": subject["履修上の注意 受講条件等	メッセージ"],
      "メッセージ": subject["メッセージ"],
      "その他": subject["その他"]
    }
  })

  // propertyToShowListの初期化
  // 便宜的に、すべてのプロパティを表示することにしている。そのためのループ。本来は変数定義時に決定する。
  // propertyToShowList = Object.keys(subjectMap["10000100"]);
  Object.keys(subjectMap["10000100"]).forEach((value) => {
    // if (propertyToShowList.length < 27)
    propertyToShowList.push(value)
  })
};

