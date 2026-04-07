// 時間割関連 ----------------------------------------------------------------------------------------------------
import {
  campuses,
  semesters,
  jikiKubunMap,
  jikiKubuns,
  kamokuKubuns,
  kaikouBukyokuGakubus,
  kaikouBukyokuDaigakuins,
  kaikouBukyokus,
  languages,
  rishuNenjiNumbers,
} from './subjectConstants';

export const youbis = ['月', '火', '水', '木', '金', '土'] as const;
export type Youbi = (typeof youbis)[number];

export const komas = [1, 2, 3, 4, 5, 6, 7] as const;
export type Koma = (typeof komas)[number];

// IMPORTANT: 「その他」は空白などの例外に対応するために設けている。2023年4月のデータでは「その他」に該当するものなし。
//  (土、6,7コマを拾うようにしたことで「その他」の出番がなくなった)
export const specialSchedules = ['集中', 'その他'] as const;
export type SpecialSchedule = (typeof specialSchedules)[number];

// TODO: YoubiKomaという名前で「集中」や「その他」を含めているが、マシな命名ができるはず
export type YoubiKoma = `${Youbi}${Koma}` | SpecialSchedule;

// IMPORTANT 「解析エラー」をundefinedとして扱う
// データを扱いやすくするために独自に設計した型 ------------------------------------------------------------------------
export interface Kaisetsuki {
  rishuNenji: number;
  semester: Semester;
  jikiKubun: JikiKubun;
}

// TODO 命名が最悪すぎる　「jigen」ってなんだ
export interface Jigen {
  youbi: Youbi;
  jigenRange: { begin: number; last: number };
  komaRange: { begin: number; last: number };
}

export interface Schedule {
  jikiKubun: JikiKubun; // 1ターム、2ターム、3ターム、4ターム、セメスター（前期）、セメスター（後期）、ターム外（前期）、ターム外（後期）、年度、通年、集中
  jigen: Jigen | undefined; // 集中講義の場合はundefined
  rooms: string[]; // 何も書かれていない場合は空文字列
}

// TODO: 動的に取得するなり、変更に対応できるようにしたい
// キャンパス ----------------------------------------------------------------------------------------------------
export type Campus = (typeof campuses)[number];

// セメスタ ー----------------------------------------------------------------------------------------------------
export type Semester = (typeof semesters)[number];

// 時期区分 ----------------------------------------------------------------------------------------------------
export type JikiKubun = (typeof jikiKubuns)[number];

export {
  campuses,
  semesters,
  jikiKubunMap,
  jikiKubuns,
  kamokuKubuns,
  kaikouBukyokuGakubus,
  kaikouBukyokuDaigakuins,
  kaikouBukyokus,
  languages,
  rishuNenjiNumbers,
};

// 科目区分 ----------------------------------------------------------------------------------------------------
export type KamokuKubun = (typeof kamokuKubuns)[number];

// 開講部局 ----------------------------------------------------------------------------------------------------
export type KaikouBukyokuGakubu = (typeof kaikouBukyokuGakubus)[number];
export type KaikouBukyokuDaigakuin = (typeof kaikouBukyokuDaigakuins)[number];
export type KaikouBukyoku = (typeof kaikouBukyokus)[number];

// 言語 ----------------------------------------------------------------------------------------------------
export type Language = (typeof languages)[number];

export type SubjectProperty =
  | 'relative URL'
  | '年度'
  | '開講部局'
  | '講義コード'
  | '科目区分'
  | '授業科目名'
  | '担当教員名'
  | '開講キャンパス'
  | '開設期'
  | '曜日・時限・講義室'
  | '単位'
  | '使用言語'
  | '教科書・参考書等'
  | '対象学生'
  | '授業の目標・概要等'
  | '予習・復習への アドバイス'
  | '履修上の注意 受講条件等	メッセージ'
  | 'メッセージ'
  | 'その他';

export type Subject = { [key in SubjectProperty]: string };

// Subject2をはじめに作っておくことで検索時に毎回parseする必要がなくなる
// TODO: 例外処理 "解析エラー"と書いているの部分をもっと良くする方法
export type Subject2 = {
  'relative URL': string;
  年度: string;
  開講部局: KaikouBukyoku;
  講義コード: string;
  科目区分: KamokuKubun;
  授業科目名: string;
  担当教員名: string[];
  開講キャンパス: Campus;
  セメスター: Semester | undefined;
  時期区分: JikiKubun | undefined;
  履修年次: number | undefined;
  '授業時間・講義室': Schedule[] | undefined;
  開設期: string;
  '曜日・時限・講義室': string;
  単位: string;
  使用言語: Language;
  '教科書・参考書等': string;
  対象学生: string;
  '授業の目標・概要等': string;
  '予習・復習への アドバイス': string;
  '履修上の注意 受講条件等	メッセージ': string;
  メッセージ: string;
  その他: string;
};

export type SubjectMap = { [subjectCode: string]: Subject };
export type Subject2Map = { [subjectCode: string]: Subject2 };

export const komaTime: { [key in Koma]: { start: string; end: string } } = {
  1: { start: '08:45', end: '10:15' },
  2: { start: '10:30', end: '12:00' },
  3: { start: '12:50', end: '14:20' },
  4: { start: '14:35', end: '16:05' },
  5: { start: '16:20', end: '17:50' },
  6: { start: '18:00', end: '19:30' },
  7: { start: '19:40', end: '21:10' },
};

// ========================================================
// ★ UI の Select コンポーネントで使用する選択肢リスト ★
// ========================================================

export const campusSelectOptions = ['指定なし', ...campuses, 'その他'] as const;
export type CampusSelectOption = (typeof campusSelectOptions)[number];

export const semesterSelectOptions = ['指定なし', ...semesters] as const;
export type SemesterSelectOption = (typeof semesterSelectOptions)[number];

export const jikiKubunSelectOptions = ['指定なし', ...jikiKubuns] as const;
export type JikiKubunSelectOption = (typeof jikiKubunSelectOptions)[number];

export const kamokuKubunSelectOptions = ['指定なし', ...kamokuKubuns] as const;
export type KamokuKubunSelectOption = (typeof kamokuKubunSelectOptions)[number];

export const languageSelectOptions = ['指定なし', ...languages] as const;
export type LanguageSelectOption = (typeof languageSelectOptions)[number];

export const courseTypeSelectOptions = ['指定なし', '学部', '大学院'] as const;
export type CourseTypeSelectOption = (typeof courseTypeSelectOptions)[number];

export const kaikouBukyokuGakubuSelectOptions = [
  '指定なし',
  ...kaikouBukyokuGakubus,
] as const;
export type KaikouBukyokuGakubuSelectOption =
  (typeof kaikouBukyokuGakubuSelectOptions)[number];
export const kaikouBukyokuDaigakuinSelectOptions = [
  '指定なし',
  ...kaikouBukyokuDaigakuins,
] as const;
export type KaikouBukyokuDaigakuinSelectOption =
  (typeof kaikouBukyokuDaigakuinSelectOptions)[number];
export const kaikouBukyokuSelectOptions = [
  '指定なし',
  ...kaikouBukyokus,
] as const;
export type KaikouBukyokuSelectOption =
  (typeof kaikouBukyokuSelectOptions)[number];

export const rishuNenjiSelectOptions = [
  '指定なし',
  ...rishuNenjiNumbers,
] as const;
export type RishuNenjiSelectOption = (typeof rishuNenjiSelectOptions)[number];

export const rishuNenjiFilterOptions = ['以下', 'のみ'] as const;
export type RishuNenjiFilterOption = (typeof rishuNenjiFilterOptions)[number];

export const bookmarkFilterOptions = [
  { value: 'all', label: '指定なし' },
  { value: 'bookmark', label: 'ブックマークのみを表示' },
  { value: 'except-bookmark', label: 'ブックマークを除外' },
] as const;
export type BookmarkFilterValue =
  (typeof bookmarkFilterOptions)[number]['value'];
