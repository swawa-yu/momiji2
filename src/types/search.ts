import {
  BookmarkFilterValue,
  CampusSelectOption,
  CourseTypeSelectOption,
  JikiKubunSelectOption,
  KaikouBukyokuSelectOption,
  KamokuKubunSelectOption,
  LanguageSelectOption,
  RishuNenjiFilterOption,
  RishuNenjiSelectOption,
  SemesterSelectOption,
  YoubiKoma,
} from '../types/subject';

export type YoubiKomaSelected = {
  [key in YoubiKoma]: boolean;
};

export interface SearchOptions {
  campus: CampusSelectOption;
  subjectName: string;
  teacher: string;
  bookmarkFilter: BookmarkFilterValue;
  kamokuKubun: KamokuKubunSelectOption;
  kaikouBukyoku: KaikouBukyokuSelectOption;
  youbiKoma: YoubiKomaSelected;
  semester: SemesterSelectOption;
  jikiKubun: JikiKubunSelectOption;
  courseType: CourseTypeSelectOption;
  language: LanguageSelectOption;
  rishuNenji: RishuNenjiSelectOption;
  rishuNenjiFilter: RishuNenjiFilterOption;
  subjectCode: string;
}
