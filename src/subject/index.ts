// import { Periods } from './period';
import { SubjectMap } from './types';

// 全授業の主要情報の辞書
import subjectData from '../../data/subject-maininfo.json'


export const subjectMap: SubjectMap = {};
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

