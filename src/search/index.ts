import { subject2Map, subjectCodeList } from '../subject';
import { SearchOptions, YoubiKomaSelected } from '../types/search';
import {
  campuses,
  KaikouBukyokuDaigakuin,
  kaikouBukyokuDaigakuins,
  KaikouBukyokuGakubu,
  kaikouBukyokuGakubus,
  komas,
  Language,
  specialSchedules,
  Subject2,
  YoubiKoma,
  youbis,
} from '../types/subject';
import {
  campusSelectOptions,
  courseTypeSelectOptions,
  jikiKubunSelectOptions,
  kaikouBukyokuDaigakuinSelectOptions,
  kaikouBukyokuGakubuSelectOptions,
  kaikouBukyokuSelectOptions,
  kamokuKubunSelectOptions,
  languageSelectOptions,
  rishuNenjiSelectOptions,
  semesterSelectOptions,
} from '../types/subject';

// 計算結果を格納する型 (再掲)
export type FilterCounts = {
  campus: Record<string, number>;
  semester: Record<string, number>;
  jikiKubun: Record<string, number>;
  kamokuKubun: Record<string, number>;
  language: Record<string, number>;
  courseType: Record<string, number>;
  kaikouBukyoku: Record<string, number>;
  rishuNenji: Record<string, number>;
};

export function calculateAllOptionCounts(
  currentOptions: SearchOptions,
  bookmarkedSubjects: Set<string>
): FilterCounts {
  // // 結果を格納するオブジェクトを初期化
  const results: FilterCounts = {
    campus: {},
    semester: {},
    jikiKubun: {},
    kamokuKubun: {},
    language: {},
    courseType: {},
    kaikouBukyoku: {},
    rishuNenji: {},
  };

  // 指定されたフィルター項目(field)の各選択肢(options)について件数を計算し、resultsに格納する内部関数
  const calculateForField = (
    field: keyof SearchOptions, // 'campus', 'semester', など
    options: ReadonlyArray<string | number> // ['衣笠', 'BKC', ...] など
  ) => {
    options.forEach((option) => {
      // '指定なし' オプション自体の件数を計算するかどうかは仕様による
      // 例: if (option === "指定なし") return; // 計算しない場合

      // 元の getFilteredCountForOption と同じロジック:
      // 現在のオプションをコピーし、指定された項目だけを上書き
      const tempOptions = { ...currentOptions, [field]: option };
      // その一時的なオプションでフィルタリングを実行し、件数を取得
      const count = filterSubjectCodeList(
        tempOptions,
        bookmarkedSubjects
      ).length; // ここが重い処理

      // 結果オブジェクトに格納 (キーは文字列に統一)
      results[field as keyof FilterCounts][String(option)] = count;
    });
  };

  // 各フィルター項目に対して calculateForField を呼び出す
  calculateForField('campus', campusSelectOptions);
  calculateForField('semester', semesterSelectOptions);
  calculateForField('jikiKubun', jikiKubunSelectOptions);
  calculateForField('kamokuKubun', kamokuKubunSelectOptions);
  calculateForField('language', languageSelectOptions);
  calculateForField('courseType', courseTypeSelectOptions);

  // 開講部局: courseType によってオプションリストが変わる点に注意
  // ここでは一旦、現在の courseType に基づいてリストを選択する例
  let kaikouBukyokuOptionsToCalc: ReadonlyArray<string>;
  switch (currentOptions.courseType) {
    case '学部':
      kaikouBukyokuOptionsToCalc = kaikouBukyokuGakubuSelectOptions;
      break;
    case '大学院':
      kaikouBukyokuOptionsToCalc = kaikouBukyokuDaigakuinSelectOptions;
      break;
    default:
      kaikouBukyokuOptionsToCalc = kaikouBukyokuSelectOptions; // "指定なし" の場合など
  }
  calculateForField('kaikouBukyoku', kaikouBukyokuOptionsToCalc);

  calculateForField('rishuNenji', rishuNenjiSelectOptions);

  // 必要であれば、'指定なし' オプションの件数を別途計算して格納
  // (現在のフィルター条件での総ヒット数と同じになるはず)
  // const totalCount = filterSubjectCodeList(currentOptions, bookmarkedSubjects).length;
  // results.campus["指定なし"] = totalCount; // 例

  console.log('Calculated all option counts:', results); // デバッグ用
  return results;

  // パフォーマンスの確認のために、検索せずにreturnする
  // return {
  //     campus: {},
  //     semester: {},
  //     jikiKubun: {},
  //     kamokuKubun: {},
  //     language: {},
  //     courseType: {},
  //     kaikouBukyoku: {},
  //     rishuNenji: {},
  // };
}

export function getFilteredCountForOption(
  fieldToSet: keyof SearchOptions, // 'campus', 'semester' など
  optionValue: any, // '東広島', '前期' など
  currentOptions: SearchOptions, // 現在のフィルター状態
  bookmarkedSubjects: Set<string> // ブックマーク情報
): number {
  // 現在のオプションをコピーし、指定された項目だけを上書き
  const tempOptions: SearchOptions = {
    ...currentOptions,
    [fieldToSet]: optionValue,
  };
  // フィルターを実行し、結果の件数 (length) を返す
  const result = filterSubjectCodeList(tempOptions, bookmarkedSubjects);
  return result.length;
}

export const initializeYoubiKoma = (
  initialValue: boolean
): YoubiKomaSelected => {
  const youbiKoma = {} as YoubiKomaSelected;

  youbis.forEach((youbi) => {
    komas.forEach((koma) => {
      youbiKoma[`${youbi}${koma}` as YoubiKoma] = initialValue;
    });
  });

  specialSchedules.forEach((special) => {
    youbiKoma[special] = initialValue;
  });

  return youbiKoma;
};

export const initialSearchOptions: SearchOptions = {
  campus: '指定なし',
  bookmarkFilter: 'all',
  teacher: '',
  subjectName: '',
  kamokuKubun: '指定なし',
  kaikouBukyoku: '指定なし',
  youbiKoma: initializeYoubiKoma(true),
  semester: '指定なし',
  jikiKubun: '指定なし',
  courseType: '指定なし',
  language: '指定なし',
  rishuNenji: '指定なし',
  rishuNenjiFilter: '以下',
  subjectCode: '',
};

// 検索条件で絞り込んだ科目のリスト(講義コードのリスト)を返す
export const filterSubjectCodeList = (
  searchOptions: SearchOptions,
  bookmarkedSubjects: Set<string>
) => {
  return subjectCodeList.filter((subjectCode) =>
    matchesSearchOptions(
      subject2Map[subjectCode],
      searchOptions,
      bookmarkedSubjects
    )
  );
};

function matchesSearchOptions(
  subject: Subject2,
  searchOptions: SearchOptions,
  bookmarkedSubjects: Set<string>
): boolean {
  return (
    matchesCampus(subject, searchOptions) &&
    matchesSubjectName(subject, searchOptions) &&
    matchesTeacher(subject, searchOptions) &&
    matchesKamokuKubun(subject, searchOptions) &&
    matchesSemester(subject, searchOptions) &&
    matchesJikiKubun(subject, searchOptions) &&
    matchesKaikouBukyoku(subject, searchOptions) &&
    matchesYoubiKoma(subject, searchOptions) &&
    matchesBookmark(subject, searchOptions, bookmarkedSubjects) &&
    matchesCourseType(subject, searchOptions) &&
    matchesLanguage(subject, searchOptions) &&
    matchesRishuNenji(subject, searchOptions) &&
    matchesSubjectCode(subject, searchOptions)
  );
}

function matchesCampus(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  return (
    searchOptions.campus === '指定なし' ||
    subject['開講キャンパス'] === searchOptions.campus ||
    (searchOptions.campus === 'その他' &&
      (subject['開講キャンパス'] === '' ||
        !campuses.includes(subject['開講キャンパス'])))
  );
}

function matchesSubjectName(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  return (
    searchOptions.subjectName === '' ||
    subject['授業科目名']
      .toLowerCase()
      .includes(searchOptions.subjectName.toLowerCase())
  );
}

function matchesTeacher(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  return (
    searchOptions.teacher === '' ||
    subject['担当教員名'].some((teacher) =>
      teacher.toLowerCase().includes(searchOptions.teacher.toLowerCase())
    )
  );
}

function matchesKamokuKubun(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  return (
    searchOptions.kamokuKubun === '指定なし' ||
    subject['科目区分'].includes(searchOptions.kamokuKubun)
  );
}

function matchesKaikouBukyoku(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  return (
    searchOptions.kaikouBukyoku === '指定なし' ||
    subject['開講部局'].includes(searchOptions.kaikouBukyoku)
  );
}

// searchOptions.youbiKomaのすべての要素について、チェックが入っている場合、次の判定をする
// 曜日が一致し、かつコマが範囲内にあるかどうかを調べ、あればtrueを返す
// 集中にチェックがある場合は集中であればtrueを返す
// その他にチェックがある場合は、「解析エラー or 月〜土の1~7コマでなくかつ集中でない」であればtrueを返す(そんな科目があるのかは不明だが、表示されない科目があると困るので)
//   (2024-01-28: その他に該当する科目は現在ないので、この部分のロジックは意味ないです。)
// 集中講義かどうかの判定は？(時期区分が集中でなくとも、schedule.jigenがundefinedのことがある。...「(3T) 集中：担当教員の指定による」みたいなパターン)
//   時期区分だけでなく、曜日の集中も集中講義判定とする
function matchesYoubiKoma(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  const schedules = subject['授業時間・講義室'];
  if (schedules === undefined) return false;

  const matchesYoubiKoma =
    youbis.some((youbi) => {
      return komas.some((koma) => {
        return (
          searchOptions.youbiKoma[`${youbi}${koma}`] === true &&
          schedules.some((schedule) => {
            return (
              (schedule.jigen?.youbi as string) === (youbi as string) &&
              (schedule.jigen?.komaRange?.begin as number) <= koma &&
              koma <= (schedule.jigen?.komaRange?.last as number)
            );
          })
        );
      });
    }) ||
    (searchOptions.youbiKoma['集中'] === true &&
      schedules.some((schedule) => {
        return schedule.jikiKubun === '集中' || schedule.jigen === undefined; // 「時期区分だけでなく、曜日の集中も集中講義判定とする」の部分
      })) ||
    (searchOptions.youbiKoma['その他'] === true &&
      schedules.some((schedule) => {
        return (
          schedule.jikiKubun === undefined ||
          (!youbis.some((youbi) => {
            return komas.some((koma) => {
              return schedules.some((schedule) => {
                return (
                  (schedule.jigen?.youbi as string) === (youbi as string) &&
                  (schedule.jigen?.komaRange?.begin as number) <= koma &&
                  koma <= (schedule.jigen?.komaRange?.last as number)
                );
              });
            });
          }) &&
            !(schedule.jikiKubun === '集中' || schedule.jigen === undefined))
        );
      }));
  return matchesYoubiKoma;
}

function matchesBookmark(
  subject: Subject2,
  searchOptions: SearchOptions,
  bookmarkedSubjects: Set<string>
): boolean {
  return (
    searchOptions.bookmarkFilter === 'all' ||
    (searchOptions.bookmarkFilter === 'bookmark' &&
      bookmarkedSubjects.has(subject['講義コード'])) ||
    (searchOptions.bookmarkFilter === 'except-bookmark' &&
      !bookmarkedSubjects.has(subject['講義コード']))
  );
}

function matchesSemester(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  const semester = subject['セメスター'];
  return (
    searchOptions.semester === '指定なし' || semester === searchOptions.semester
  );
}

function matchesJikiKubun(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  const jikiKubun = subject['時期区分'];
  return (
    searchOptions.jikiKubun === '指定なし' ||
    jikiKubun === searchOptions.jikiKubun
  );
}

function matchesCourseType(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  return (
    searchOptions.courseType === '指定なし' ||
    (searchOptions.courseType === '学部' &&
      kaikouBukyokuGakubus.includes(
        subject['開講部局'] as KaikouBukyokuGakubu
      )) ||
    (searchOptions.courseType === '大学院' &&
      kaikouBukyokuDaigakuins.includes(
        subject['開講部局'] as KaikouBukyokuDaigakuin
      ))
  );
}

function matchesLanguage(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  return (
    searchOptions.language === '指定なし' ||
    (subject['使用言語'] as Language) === searchOptions.language
  );
}

function matchesRishuNenji(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  if (subject['履修年次'] === undefined) return false;
  return (
    searchOptions.rishuNenji === '指定なし' ||
    (searchOptions.rishuNenjiFilter === '以下' &&
      subject['履修年次'] <= searchOptions.rishuNenji) ||
    (searchOptions.rishuNenjiFilter === 'のみ' &&
      subject['履修年次'] == searchOptions.rishuNenji)
  );
}

function matchesSubjectCode(
  subject: Subject2,
  searchOptions: SearchOptions
): boolean {
  return subject['講義コード'].startsWith(searchOptions.subjectCode);
}
