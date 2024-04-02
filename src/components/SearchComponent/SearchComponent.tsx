import React from 'react';
import { SearchOptions, BookmarkFilter, YoubiKomaSelected } from '../../types/search';
import KomaSelector from './KomaSelector';
import { initialSearchOptions } from '../../search';
import './SearchComponent.css';
import { kaikouBukyokus, kaikouBukyokuGakubus, kaikouBukyokuDaigakuins } from '../../types/subject';

type SearchComponentProps = {
    setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
    searchOptions: SearchOptions;
};

// TODO: あいまい検索に対応(generalSearch)
const SearchComponent: React.FC<SearchComponentProps> = ({ searchOptions, setSearchOptions }: SearchComponentProps) => {
    const handleClear = () => {
        setSearchOptions(initialSearchOptions);
    };

    const handleYoubiKomaChange = (newYoubiKoma: YoubiKomaSelected) => {
        setSearchOptions({ ...searchOptions, youbiKoma: newYoubiKoma });
    };


    return (
        <>
            <h2>検索条件</h2>
            <div className='search-component'>
                <div className='search-groups'>
                    <div>
                        <div className='search-group'>
                            <label htmlFor="campus-select">キャンパス:</label>
                            <select
                                id="campus-select"
                                value={searchOptions.campus}
                                onChange={(e) => setSearchOptions({ ...searchOptions, campus: e.target.value as SearchOptions['campus'] })}
                            >
                                <option value="指定なし">指定なし</option>
                                <option value="東広島">東広島</option>
                                <option value="霞">霞</option>
                                <option value="東千田">東千田</option>
                                <option value="その他">その他</option>
                            </select>
                        </div>

                        <div className='search-group'>
                            <label htmlFor="semester-select">セメスター:</label>
                            <select
                                id="semester-select"
                                value={searchOptions.semester}
                                onChange={(e) => setSearchOptions({ ...searchOptions, semester: e.target.value as SearchOptions['semester'] })}
                            >
                                <option value="指定なし">指定なし</option>
                                <option value="前期">前期</option>
                                <option value="後期">後期</option>
                            </select>
                        </div>

                        <div className='search-group'>
                            {/* TODO: 時期区分はチェックボックスにしたい */}
                            <label htmlFor="jiki-kubun-select">時期区分:</label>
                            <select
                                id="jiki-kubun-select"
                                value={searchOptions.jikiKubun}
                                onChange={(e) => setSearchOptions({ ...searchOptions, jikiKubun: e.target.value as SearchOptions['jikiKubun'] })}
                            >
                                <option value="指定なし">指定なし</option>
                                <option value="１ターム">１ターム</option>
                                <option value="２ターム">２ターム</option>
                                <option value="３ターム">３ターム</option>
                                <option value="４ターム">４ターム</option>
                                <option value="セメスター（前期）">セメスター（前期）</option>
                                <option value="セメスター（後期）">セメスター（後期）</option>
                                <option value="ターム外（前期）">ターム外（前期）</option>
                                <option value="ターム外（後期）">ターム外（後期）</option>
                                <option value="年度">年度</option>
                                <option value="通年">通年</option>
                                <option value="集中">集中</option>
                            </select>
                        </div>

                        <div className='search-group'>
                            {/* 科目区分のドロップダウンメニュー */}
                            <label htmlFor="kamoku-kubun-select">科目区分:</label>
                            <select
                                id="kamoku-kubun-select"
                                value={searchOptions.kamokuKubun}
                                onChange={(e) => setSearchOptions({ ...searchOptions, kamokuKubun: e.target.value })}
                            >
                                <option value="">指定なし</option>
                                {/* export const kamokuKubuns = [
    "大学教育入門", "展開ゼミ", "平和科目", "外国語科目", "情報・データサイエンス科目", "領域科目", "基盤科目", "社会連携科目", "健康スポーツ科目", "教養教育科目（昼）", "教養教育科目（夜）", "専門教育科目", "教職専門科目", "他学部・他研究科科目", "大学院共通科目", "専門的教育科目"
] as const */}
                                <option value="大学教育入門">{"(教養科目)     大学教育入門"}</option>
                                <option value="展開ゼミ">{"(教養科目)     展開ゼミ"}</option>
                                <option value="平和科目">{"(教養科目)     平和科目"}</option>
                                <option value="外国語科目">{"(教養科目)     外国語科目"}</option>
                                <option value="情報・データサイエンス科目">{"(教養科目)     情報・データサイエンス科目"}</option>
                                <option value="領域科目">{"(教養科目)     領域科目"}</option>
                                <option value="基盤科目">{"(教養科目)     基盤科目"}</option>
                                <option value="社会連携科目">{"(教養科目)     社会連携科目"}</option>
                                <option value="健康スポーツ科目">{"(教養科目)     健康スポーツ科目"}</option>
                                <option value="教養教育科目（昼）">{"(教養ゼミ)     教養教育科目（昼）"}</option>
                                <option value="教養教育科目（夜）">{"(教養ゼミ)     教養教育科目（夜）"}</option>
                                <option value="専門教育科目">専門教育科目</option>
                                <option value="教職専門科目">教職専門科目</option>
                                <option value="他学部・他研究科科目">他学部・他研究科科目</option>
                                <option value="大学院共通科目">大学院共通科目</option>
                                <option value="専門的教育科目">専門的教育科目</option>
                            </select>
                        </div>

                        <div className='search-group'>
                            <label htmlFor="language-select">使用言語:</label>
                            <select
                                id="language-select"
                                value={searchOptions.language}
                                onChange={(e) => setSearchOptions({ ...searchOptions, language: e.target.value as SearchOptions['language'] })}
                            >
                                <option value="指定なし">指定なし</option>
                                <option value="J : 日本語">J : 日本語</option>
                                <option value="E : 英語">E : 英語</option>
                                <option value="B : 日本語・英語">B : 日本語・英語</option>
                                <option value="O : その他">O : その他</option>
                            </select>
                        </div>

                        <div className='search-group'>
                            <label htmlFor="course-type-select">学部／大学院:</label>
                            <select
                                id="course-type-select"
                                value={searchOptions.courseType}
                                onChange={(e) => setSearchOptions({ ...searchOptions, courseType: e.target.value as SearchOptions['courseType'] })}
                            >
                                <option value="指定なし">指定なし</option>
                                <option value="学部">学部</option>
                                <option value="大学院">大学院</option>
                            </select>
                        </div>

                        <div className='search-group'>
                            {/* 開講部局のドロップダウンメニュー */}
                            <label htmlFor="kaikou-bukyoku-select">開講部局:</label>
                            <select
                                id="kaikou-bukyoku-select"
                                value={searchOptions.kaikouBukyoku}
                                onChange={(e) => setSearchOptions({ ...searchOptions, kaikouBukyoku: e.target.value })}
                            >
                                <option value="">指定なし</option>
                                {/* 表示するメニューをsearchOptions.courseTypeによってメニューに合わせる */}
                                {(() => {
                                    const KaikouBukyokusToDisplay = (() => {
                                        switch (searchOptions.courseType) {
                                            case "学部":
                                                return kaikouBukyokuGakubus;
                                            case "大学院":
                                                return kaikouBukyokuDaigakuins;
                                            default:
                                                return kaikouBukyokus;
                                        }
                                    })()

                                    return KaikouBukyokusToDisplay.map((kaikouBukyoku) => (
                                        <option key={kaikouBukyoku} value={kaikouBukyoku}>{kaikouBukyoku}</option>
                                    ));
                                })()}
                            </select>
                        </div>

                        <div className='search-group'>
                            <label htmlFor="rishu-nenji-select">履修年次:</label>
                            <select
                                id="rishu-nenji-select"
                                value={searchOptions.rishuNenji}
                                onChange={(e) => setSearchOptions({ ...searchOptions, rishuNenji: e.target.value as SearchOptions['rishuNenji'] })}
                            >
                                <option value="指定なし">指定なし</option>
                                <option value="1">1年次</option>
                                <option value="2">2年次</option>
                                <option value="3">3年次</option>
                                <option value="4">4年次</option>
                                <option value="5">5年次</option>
                                <option value="6">6年次</option>
                            </select>
                            <select
                                id="rishu-nenji-filter-select"
                                value={searchOptions.rishuNenjiFilter}
                                onChange={(e) => setSearchOptions({ ...searchOptions, rishuNenjiFilter: e.target.value as SearchOptions['rishuNenjiFilter'] })}
                            >
                                <option value="以下">以下</option>
                                <option value="のみ">のみ</option>
                            </select>
                        </div>


                    </div>
                    <div>
                        <div className='search-group'>
                            <label htmlFor="subject-name">授業科目名(部分一致): </label>
                            <input
                                id="subject-name"
                                type="text"
                                value={searchOptions.subjectName}
                                onChange={(e) => setSearchOptions({ ...searchOptions, subjectName: e.target.value })}
                                placeholder="授業科目名"
                            /></div>

                        <div className='search-group'>
                            <br></br>

                            <label htmlFor="teacher-name">担当教員名(部分一致): </label>
                            <input
                                id='teacher-name'
                                type="text"
                                value={searchOptions.teacher}
                                onChange={(e) => setSearchOptions({ ...searchOptions, teacher: e.target.value })}
                                placeholder="担当教員名"
                            />
                        </div>

                        <div className='search-group'>
                            <label htmlFor="bookmark-filter">ブックマーク:</label>
                            <select
                                id="bookmark-filter"
                                value={searchOptions.bookmarkFilter}
                                onChange={(e) => setSearchOptions({ ...searchOptions, bookmarkFilter: e.target.value as BookmarkFilter })}
                            >
                                <option value="all">指定なし</option>
                                <option value="bookmark">ブックマークのみを表示</option>
                                <option value="except-bookmark">ブックマークを除外</option>
                            </select>
                        </div>
                    </div>
                    <KomaSelector onSelectionChange={handleYoubiKomaChange} />
                </div>
                <div className='do-search'>
                    <button onClick={handleClear}>検索条件をクリア</button>
                </div>
            </div >
        </>
    );
};

export default SearchComponent;
