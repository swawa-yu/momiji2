import React from 'react';
import { SearchOptions, BookmarkFilter, YoubiKomaSelected } from '../../types/search';
import KomaSelector from './KomaSelector';
import { initialSearchOptions } from '../../search';
import './SearchComponent.css';
import { kaikouBukyokus, kaikouBukyokuGakubus, kaikouBukyokuDaigakuins } from '../../types/subject';
import Button from '@mui/material/Button';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

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

    const handleCampusChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, campus: event.target.value as SearchOptions['campus'] }); };
    const handleSemesterChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, semester: event.target.value as SearchOptions['semester'] }); };
    const handleJikiKubunChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, jikiKubun: event.target.value as SearchOptions['jikiKubun'] }); };
    const handleKamokuKubunChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, kamokuKubun: event.target.value as SearchOptions['kamokuKubun'] | "指定なし" }); }; // TODO: 型を作成する
    const handleLanguageChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, language: event.target.value as SearchOptions['language'] }); };
    const handleCourseTypeChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, courseType: event.target.value as SearchOptions['courseType'] }); };
    const handleKaikouBukyokuChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, kaikouBukyoku: event.target.value as SearchOptions['kaikouBukyoku'] | "指定なし" }); };
    const handleRishuNenjiChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, rishuNenji: event.target.value as SearchOptions['rishuNenji'] }); };
    const handleRishuNenjiFilterChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, rishuNenjiFilter: event.target.value as SearchOptions['rishuNenjiFilter'] }); };
    const handleBookmarkFilterChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, bookmarkFilter: event.target.value as BookmarkFilter }); };



    return (
        <>
            <Box sx={{ border: '1px solid #ccc', p: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Stack spacing={2}>
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="campus-select-label">キャンパス</InputLabel>
                                <Select
                                    labelId="campus-select-label"
                                    id="campus-select"
                                    value={searchOptions.campus}
                                    label="キャンパス"
                                    onChange={handleCampusChange}
                                >
                                    <MenuItem value="指定なし">指定なし</MenuItem>
                                    <MenuItem value="東広島">東広島</MenuItem>
                                    <MenuItem value="霞">霞</MenuItem>
                                    <MenuItem value="東千田">東千田</MenuItem>
                                    <MenuItem value="その他">その他</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="semester-select-label">セメスター</InputLabel>
                                <Select
                                    labelId="semester-select-label"
                                    id="semester-select"
                                    value={searchOptions.semester}
                                    label="セメスター"
                                    onChange={handleSemesterChange}
                                >
                                    <MenuItem value="指定なし">指定なし</MenuItem>
                                    <MenuItem value="前期">前期</MenuItem>
                                    <MenuItem value="後期">後期</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="jiki-kubun-select-label">時期区分</InputLabel>
                                <Select
                                    labelId="jiki-kubun-select-label"
                                    id="jiki-kubun-select"
                                    value={searchOptions.jikiKubun}
                                    label="時期区分"
                                    onChange={handleJikiKubunChange}
                                >
                                    <MenuItem value="指定なし">指定なし</MenuItem>
                                    <MenuItem value="１ターム">１ターム</MenuItem>
                                    <MenuItem value="２ターム">２ターム</MenuItem>
                                    <MenuItem value="３ターム">３ターム</MenuItem>
                                    <MenuItem value="４ターム">４ターム</MenuItem>
                                    <MenuItem value="セメスター（前期）">セメスター（前期）</MenuItem>
                                    <MenuItem value="セメスター（後期）">セメスター（後期）</MenuItem>
                                    <MenuItem value="ターム外（前期）">ターム外（前期）</MenuItem>
                                    <MenuItem value="ターム外（後期）">ターム外（後期）</MenuItem>
                                    <MenuItem value="年度">年度</MenuItem>
                                    <MenuItem value="通年">通年</MenuItem>
                                    <MenuItem value="集中">集中</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="kamoku-kubun-select-label">科目区分</InputLabel>
                                <Select
                                    labelId="kamoku-kubun-select-label"
                                    id="kamoku-kubun-select"
                                    value={searchOptions.kamokuKubun}
                                    label="科目区分"
                                    onChange={handleKamokuKubunChange}
                                >
                                    <MenuItem value="指定なし">指定なし</MenuItem>
                                    <MenuItem value="大学教育入門">{"(教養科目)     大学教育入門"}</MenuItem>
                                    <MenuItem value="展開ゼミ">{"(教養科目)     展開ゼミ"}</MenuItem>
                                    <MenuItem value="平和科目">{"(教養科目)     平和科目"}</MenuItem>
                                    <MenuItem value="外国語科目">{"(教養科目)     外国語科目"}</MenuItem>
                                    <MenuItem value="情報・データサイエンス科目">{"(教養科目)     情報・データサイエンス科目"}</MenuItem>
                                    <MenuItem value="領域科目">{"(教養科目)     領域科目"}</MenuItem>
                                    <MenuItem value="基盤科目">{"(教養科目)     基盤科目"}</MenuItem>
                                    <MenuItem value="社会連携科目">{"(教養科目)     社会連携科目"}</MenuItem>
                                    <MenuItem value="健康スポーツ科目">{"(教養科目)     健康スポーツ科目"}</MenuItem>
                                    <MenuItem value="教養教育科目（昼）">{"(教養ゼミ)     教養教育科目（昼）"}</MenuItem>
                                    <MenuItem value="教養教育科目（夜）">{"(教養ゼミ)     教養教育科目（夜）"}</MenuItem>
                                    <MenuItem value="専門教育科目">専門教育科目</MenuItem>
                                    <MenuItem value="教職専門科目">教職専門科目</MenuItem>
                                    <MenuItem value="他学部・他研究科科目">他学部・他研究科科目</MenuItem>
                                    <MenuItem value="大学院共通科目">大学院共通科目</MenuItem>
                                    <MenuItem value="専門的教育科目">専門的教育科目</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="language-select-label">使用言語</InputLabel>
                                <Select
                                    labelId="language-select-label"
                                    id="language-select"
                                    value={searchOptions.language}
                                    label="使用言語"
                                    onChange={handleLanguageChange}
                                >
                                    <MenuItem value="指定なし">指定なし</MenuItem>
                                    <MenuItem value="J : 日本語">J : 日本語</MenuItem>
                                    <MenuItem value="E : 英語">E : 英語</MenuItem>
                                    <MenuItem value="B : 日本語・英語">B : 日本語・英語</MenuItem>
                                    <MenuItem value="O : その他">O : その他</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="course-type-select-label">学部／大学院</InputLabel>
                                <Select
                                    labelId="course-type-select-label"
                                    id="course-type-select"
                                    value={searchOptions.courseType}
                                    label="学部／大学院"
                                    onChange={handleCourseTypeChange}
                                >
                                    <MenuItem value="指定なし">指定なし</MenuItem>
                                    <MenuItem value="学部">学部</MenuItem>
                                    <MenuItem value="大学院">大学院</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="kaikou-bukyoku-select-label">開講部局</InputLabel>
                                <Select
                                    labelId="kaikou-bukyoku-select-label"
                                    id="kaikou-bukyoku-select"
                                    value={searchOptions.kaikouBukyoku}
                                    label="開講部局"
                                    onChange={handleKaikouBukyokuChange}
                                >
                                    <MenuItem value="指定なし">指定なし</MenuItem>
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
                                            <MenuItem key={kaikouBukyoku} value={kaikouBukyoku}>{kaikouBukyoku}</MenuItem>
                                        ));
                                    })()}
                                </Select>
                            </FormControl>
                            <Box sx={{ minWidth: 80 }}>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item xs={7}>
                                        <FormControl fullWidth size="small" variant="outlined">
                                            <InputLabel id="rishu-nenji-select-label">年次</InputLabel>
                                            <Select
                                                labelId="rishu-nenji-select-label"
                                                id="rishu-nenji-select"
                                                value={searchOptions.rishuNenji as string}
                                                label="年次"
                                                onChange={handleRishuNenjiChange}
                                            >
                                                <MenuItem value="指定なし">指定なし</MenuItem>
                                                <MenuItem value="1">1</MenuItem>
                                                <MenuItem value="2">2</MenuItem>
                                                <MenuItem value="3">3</MenuItem>
                                                <MenuItem value="4">4</MenuItem>
                                                <MenuItem value="5">5</MenuItem>
                                                <MenuItem value="6">6</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={5}>
                                        {/* TODO: 「指定なし」のときに非表示/非活性にする */}
                                        <FormControl fullWidth size="small" variant="outlined">
                                            <InputLabel id="rishu-nenji-filter-select-label">条件</InputLabel>
                                            <Select
                                                labelId="rishu-nenji-filter-select-label"
                                                id="rishu-nenji-filter-select"
                                                value={searchOptions.rishuNenjiFilter}
                                                label="条件"
                                                onChange={handleRishuNenjiFilterChange}
                                            >
                                                <MenuItem value="以下">以下</MenuItem>
                                                <MenuItem value="のみ">のみ</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Stack spacing={2}>
                            <TextField
                                id="subject-name"
                                label="授業科目名(部分一致)"
                                variant="outlined"
                                size="small"
                                value={searchOptions.subjectName}
                                onChange={(e) => setSearchOptions({ ...searchOptions, subjectName: e.target.value })}
                                // placeholder="例: 力学"
                                sx={{ minWidth: 80 }}
                            />
                            <TextField
                                id="teacher-name"
                                label="担当教員名(部分一致)"
                                variant="outlined"
                                size="small"
                                value={searchOptions.teacher}
                                onChange={(e) => setSearchOptions({ ...searchOptions, teacher: e.target.value })}
                                // placeholder="例: 田中太郎"
                                sx={{ minWidth: 80 }}
                            />
                            <TextField
                                id="subject-code"
                                label="講義コード(部分一致)" // TODO: 前方一致にする
                                variant="outlined"
                                size="small"
                                value={searchOptions.subjectCode}
                                onChange={(e) => setSearchOptions({ ...searchOptions, subjectCode: e.target.value })}
                                // placeholder="例: CC2(教育学部第二類)"
                                sx={{ minWidth: 80 }}
                            />

                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="bookmark-filter-select-label">ブックマーク</InputLabel>
                                <Select
                                    labelId="bookmark-filter-select-label"
                                    id="bookmark-filter-select"
                                    value={searchOptions.bookmarkFilter}
                                    label="ブックマーク"
                                    onChange={handleBookmarkFilterChange}
                                >
                                    <MenuItem value="all">指定なし</MenuItem>
                                    <MenuItem value="bookmark">ブックマークのみを表示</MenuItem>
                                    <MenuItem value="except-bookmark">ブックマークを除外</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Grid >

                    <Grid item xs={12} md={4} >
                        <KomaSelector onSelectionChange={handleYoubiKomaChange} />
                    </Grid >
                </Grid >

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={handleClear}>
                        検索条件をクリア
                    </Button>
                </Box>
            </Box >
        </>
    );
};

export default SearchComponent;
