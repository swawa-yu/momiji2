// import { Periods } from './period';
// 全授業の主要情報の辞書
// import subjectData from '../../data/subject_details_main.json'
// import subjectData from '../../data/subject-maininfo.json'
import {
  campuses,
  jikiKubuns,
  kaikouBukyokuDaigakuins,
  kaikouBukyokuGakubus,
  kaikouBukyokus,
  kamokuKubuns,
  languages,
  RawSubjectMap,
  semesters,
  Subject2,
} from '../types/subject';
import { subjectData } from './activeSubjectData';
import { parseKaisetsuki, parseSchedule } from './utils';

export const subjectMap: RawSubjectMap = {};
export const subject2Map: { [subjectCode: string]: Subject2 } = {};
export const subjectCodeList = Object.keys(subjectMap);

// 何を表示するかここで決める
// export const propertyToShowList = ["講義コード", "開講部局", "開設期", "授業科目名", "単位", "教科書・参考書等"]
// ※今は便宜的にすべてのプロパティを表示するためにinitializeSubject()内で初期化している。
export const propertyToShowList: string[] = [];

export const subjectProperties: string[] = [];

// TODO setTimeout()ってなに, async await って使ったほうがいいの？

type OptionCounts = { [key: string]: { [option: string | number]: number } };
export let totalOptionCounts: OptionCounts = {};

function toKnownValue<T extends readonly string[]>(
  value: string,
  options: T,
  field: string
): T[number] {
  if (!options.includes(value as T[number])) {
    throw new Error(`Unknown ${field} value in syllabus data: ${value}`);
  }

  return value as T[number];
}

function toKnownValueOrEmpty<T extends readonly string[]>(
  value: string,
  options: T,
  field: string
): T[number] | '' {
  return value === '' ? '' : toKnownValue(value, options, field);
}

export const initializeSubject = () => {
  // subjectMap, subjectCodeList, propertyToShowListの初期化
  Object.keys(subjectMap).forEach((key) => {
    delete subjectMap[key];
  });
  subjectCodeList.length = 0;
  propertyToShowList.length = 0;

  // subjectMap, subjectCodeListの初期化
  // 授業データの読み込み
  const rawSubjectMap: RawSubjectMap = subjectData;

  // 表示する授業を記憶しておく配列とかに値を設定する
  Object.entries(rawSubjectMap).forEach(([subjectCode, subject]) => {
    subjectMap[subjectCode] = subject;
    subjectCodeList.push(subjectCode);
  });

  Object.entries(subjectMap).forEach(([subjectCode, subject]) => {
    const kaisetsuki = parseKaisetsuki(subject['開設期']);
    const schedules = parseSchedule(subject['曜日・時限・講義室']);
    subject2Map[subjectCode] = {
      ...subject,
      開講部局: toKnownValue(subject['開講部局'], kaikouBukyokus, '開講部局'),
      科目区分: toKnownValueOrEmpty(
        subject['科目区分'],
        kamokuKubuns,
        '科目区分'
      ),
      担当教員名: subject['担当教員名'].split(',').filter((s) => s !== 'null'),
      開講キャンパス: toKnownValueOrEmpty(
        subject['開講キャンパス'],
        campuses,
        '開講キャンパス'
      ),
      セメスター: kaisetsuki ? kaisetsuki.semester : undefined,
      時期区分: kaisetsuki ? kaisetsuki.jikiKubun : undefined,
      履修年次: kaisetsuki ? kaisetsuki.rishuNenji : undefined,
      '授業時間・講義室': schedules,
      使用言語: toKnownValue(subject['使用言語'], languages, '使用言語'),
    };
  });

  // --- ▼▼▼ ここからヒット数計算ロジックを追加 ▼▼▼ ---
  const calculatedCounts: OptionCounts = {};
  const allSubjects = Object.values(subject2Map); // subject2Map の全授業データを取得
  const totalSubjects = allSubjects.length;

  // 項目ごとにカウントを初期化するヘルパー
  const initField = (field: keyof OptionCounts) => {
    if (!calculatedCounts[field]) calculatedCounts[field] = {};
  };

  // --- 各フィルター項目ごとにカウント ---

  initField('campus');
  calculatedCounts.campus['指定なし'] = totalSubjects;
  [...campuses, 'その他'].forEach((option) => {
    calculatedCounts.campus[option] = allSubjects.filter((s) => {
      const subjectCampus = s.開講キャンパス;
      if (option === 'その他') {
        // campuses 配列に含まれないものを「その他」とする
        return subjectCampus === '' || !campuses.includes(subjectCampus);
      }
      return subjectCampus === option;
    }).length;
  });

  initField('semester');
  calculatedCounts.semester['指定なし'] = totalSubjects;
  semesters.forEach((option) => {
    calculatedCounts.semester[option] = allSubjects.filter(
      (s) => s.セメスター === option
    ).length;
  });

  initField('jikiKubun');
  calculatedCounts.jikiKubun['指定なし'] = totalSubjects;
  jikiKubuns.forEach((option) => {
    calculatedCounts.jikiKubun[option] = allSubjects.filter(
      (s) => s.時期区分 === option
    ).length;
  });

  // 科目区分 (kamokuKubun) - UIでは "" が "指定なし"
  initField('kamokuKubun');
  calculatedCounts.kamokuKubun['指定なし'] = totalSubjects; // UIの value に合わせる
  kamokuKubuns.forEach((option) => {
    calculatedCounts.kamokuKubun[option] = allSubjects.filter(
      (s) => s.科目区分 === option
    ).length;
  });

  initField('language');
  calculatedCounts.language['指定なし'] = totalSubjects;
  languages.forEach((option) => {
    calculatedCounts.language[option] = allSubjects.filter(
      (s) => s.使用言語 === option
    ).length;
  });

  // 学部／大学院 (courseType) - 派生データ
  initField('courseType');
  calculatedCounts.courseType['指定なし'] = totalSubjects;
  calculatedCounts.courseType['学部'] = allSubjects.filter((s) =>
    kaikouBukyokuGakubus.some((value) => value === s.開講部局)
  ).length;
  calculatedCounts.courseType['大学院'] = allSubjects.filter((s) =>
    kaikouBukyokuDaigakuins.some((value) => value === s.開講部局)
  ).length;

  // 開講部局 (kaikouBukyoku) - UIでは "" が "指定なし"
  initField('kaikouBukyoku');
  calculatedCounts.kaikouBukyoku['指定なし'] = totalSubjects; // UIの value に合わせる
  kaikouBukyokus.forEach((option) => {
    calculatedCounts.kaikouBukyoku[option] = allSubjects.filter(
      (s) => s.開講部局 === option
    ).length;
  });

  // 履修年次 (rishuNenji) - 値は number だが key は string
  initField('rishuNenji');
  calculatedCounts.rishuNenji['指定なし'] = totalSubjects;
  [1, 2, 3, 4, 5, 6].forEach((option) => {
    calculatedCounts.rishuNenji[option] = allSubjects.filter(
      (s) => s.履修年次 === option
    ).length;
  });

  // --- 計算終わり ---

  totalOptionCounts = calculatedCounts;
  console.log('Total option counts calculated:', totalOptionCounts);

  // propertyToShowListの初期化
  // 便宜的に、すべてのプロパティを表示することにしている。そのためのループ。本来は変数定義時に決定する。
  // propertyToShowList = Object.keys(subjectMap["10000100"]);
  Object.keys(subjectMap['10000100']).forEach((value) => {
    // if (propertyToShowList.length < 27)
    propertyToShowList.push(value);
  });
};
