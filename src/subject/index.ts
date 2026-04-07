// import { Periods } from './period';
// 全授業の主要情報の辞書
// import subjectData from '../../data/subject_details_main.json'
// import subjectData from '../../data/subject-maininfo.json'
import subjectData from '../../data/subject_details_main_2026-04-07.json';
import {
  campuses,
  jikiKubuns,
  KaikouBukyoku,
  kaikouBukyokuDaigakuins,
  kaikouBukyokuGakubus,
  kaikouBukyokus,
  Campus,
  KamokuKubun,
  kamokuKubuns,
  Language,
  languages,
  semesters,
  Subject,
  Subject2,
  SubjectMap,
} from '../types/subject';
import { parseKaisetsuki, parseSchedule } from './utils';

export const subjectMap: SubjectMap = {};
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

export const initializeSubject = () => {
  // subjectMap, subjectCodeList, propertyToShowListの初期化
  Object.keys(subjectMap).forEach((key) => {
    delete subjectMap[key];
  });
  subjectCodeList.length = 0;
  propertyToShowList.length = 0;

  // subjectMap, subjectCodeListの初期化
  // 授業データの読み込み
  const subjectMap_ = subjectData as unknown as SubjectMap;

  // 表示する授業を記憶しておく配列とかに値を設定する
  Object.entries(subjectMap_).forEach(([subjectCode, subject]) => {
    subjectMap[subjectCode] = subject as Subject;
    subjectCodeList.push(subjectCode);
  });

  Object.entries(subjectMap).forEach(([subjectCode, subject]) => {
    const kaisetsuki = parseKaisetsuki(subject['開設期']);
    const schedules = parseSchedule(subject['曜日・時限・講義室']);
    subject2Map[subjectCode] = {
      'relative URL': subject['relative URL'],
      年度: subject['年度'],
      開講部局: subject['開講部局'] as KaikouBukyoku,
      講義コード: subject['講義コード'],
      科目区分: subject['科目区分'] as KamokuKubun,
      授業科目名: subject['授業科目名'],
      担当教員名: subject['担当教員名'].split(',').filter((s) => s !== 'null'),
      開講キャンパス: subject['開講キャンパス'] as Campus,
      セメスター: kaisetsuki ? kaisetsuki.semester : undefined,
      時期区分: kaisetsuki ? kaisetsuki.jikiKubun : undefined,
      履修年次: kaisetsuki ? kaisetsuki.rishuNenji : undefined,
      '授業時間・講義室': schedules,
      開設期: subject['開設期'],
      '曜日・時限・講義室': subject['曜日・時限・講義室'],
      単位: subject['単位'],
      使用言語: subject['使用言語'] as Language,
      '教科書・参考書等': subject['教科書・参考書等'],
      対象学生: subject['対象学生'],
      '授業の目標・概要等': subject['授業の目標・概要等'],
      '予習・復習への アドバイス': subject['予習・復習への アドバイス'],
      '履修上の注意 受講条件等	メッセージ':
        subject['履修上の注意 受講条件等	メッセージ'],
      メッセージ: subject['メッセージ'],
      その他: subject['その他'],
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
      const subjectCampus = s.開講キャンパス as
        | (typeof campuses)[number]
        | undefined; // 型付け
      if (option === 'その他') {
        // campuses 配列に含まれないものを「その他」とする
        return subjectCampus !== undefined && !campuses.includes(subjectCampus);
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
    kaikouBukyokuGakubus.includes(s.開講部局 as any)
  ).length;
  calculatedCounts.courseType['大学院'] = allSubjects.filter((s) =>
    kaikouBukyokuDaigakuins.includes(s.開講部局 as any)
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
