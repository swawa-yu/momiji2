import { subjectCodeList, subjectMap, Subject } from "../subject";

// 検索条件で絞り込んだ科目のリスト(講義コードのリスト)を返す
export const filteredSubjectCodeList = (searchOptions: SearchOptions) => {
    return subjectCodeList.filter(
        (subjectCode: string) => matchesSearchOptions(subjectMap[subjectCode], searchOptions)
    );
}

export interface SearchOptions {
    campus: string;
    // keyword: string;
    // year: string;
    bookmarkFilter: 'all' | 'bookmark' | 'except-bookmark';
    // season: NormalSeasons | undefined;
    // module: Modules | undefined;
    // periods: Periods;
    // disablePeriods: Periods | null;
    // containsName: boolean;
    // containsCode: boolean;
    // containsRoom: boolean;
    // containsPerson: boolean;
    // containsAbstract: boolean;
    // containsNote: boolean;
    // filter: 'all' | 'bookmark' | 'except-bookmark';
    // concentration: boolean;
    // negotiable: boolean;
    // asneeded: boolean;
}

export function matchesSearchOptions(subject: Subject, searchOptions: SearchOptions): boolean {
    let machesCampus = searchOptions.campus === "" || subject["開講キャンパス"] === searchOptions.campus;

    return machesCampus;
}
