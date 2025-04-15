import React from 'react';
import { SearchOptions, YoubiKomaSelected } from '../../types/search';
import {
    campusSelectOptions,
    semesterSelectOptions,
    jikiKubunSelectOptions,
    kamokuKubunSelectOptions,
    languageSelectOptions,
    courseTypeSelectOptions,
    kaikouBukyokuSelectOptions,
    kaikouBukyokuGakubuSelectOptions,
    kaikouBukyokuDaigakuinSelectOptions,
    rishuNenjiSelectOptions,
    rishuNenjiFilterOptions,
    bookmarkFilterOptions,
} from '../../types/subject';
import { totalOptionCounts } from '../../subject';
import KomaSelector from './KomaSelector';
import { initialSearchOptions } from '../../search';
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
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';

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
    const handleKamokuKubunChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, kamokuKubun: event.target.value as SearchOptions['kamokuKubun'] }); };
    const handleLanguageChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, language: event.target.value as SearchOptions['language'] }); };
    const handleCourseTypeChange = (event: SelectChangeEvent) => {
        const newCourseType = event.target.value as SearchOptions['courseType'];
        setSearchOptions({ ...searchOptions, courseType: newCourseType, kaikouBukyoku: "指定なし" });
    };
    const handleKaikouBukyokuChange = (_event: React.SyntheticEvent, newValue: SearchOptions['kaikouBukyoku'] | null) => {
        setSearchOptions({ ...searchOptions, kaikouBukyoku: newValue ?? "指定なし" });
    };
    const handleRishuNenjiChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, rishuNenji: event.target.value as SearchOptions['rishuNenji'] }); };
    const handleRishuNenjiFilterChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, rishuNenjiFilter: event.target.value as SearchOptions['rishuNenjiFilter'] }); };
    const handleBookmarkFilterChange = (event: SelectChangeEvent) => { setSearchOptions({ ...searchOptions, bookmarkFilter: event.target.value as SearchOptions['bookmarkFilter'] }); };

    const kaikouBukyokuFilteredOptions = React.useMemo(() => {
        switch (searchOptions.courseType) {
            case "学部":
                return kaikouBukyokuGakubuSelectOptions;
            case "大学院":
                return kaikouBukyokuDaigakuinSelectOptions;
            default:
                return kaikouBukyokuSelectOptions;
        }
    }, [searchOptions.courseType]);

    const renderKaikouBukyokuOption = (
        props: React.HTMLAttributes<HTMLLIElement>,
        option: string
    ) => {
        const count = totalOptionCounts?.kaikouBukyoku?.[option] || 0;
        const label = option;
        return (
            <li {...props}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="body2" component="span" sx={{ flexGrow: 1, mr: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {label}
                    </Typography>
                    <Typography variant="body2" component="span" sx={{ color: 'text.secondary', fontSize: '0.8em', flexShrink: 0 }}>
                        (/ {count})
                    </Typography>
                </Box>
            </li>
        );
    };

    const CountDisplay = ({ count }: { count: number | undefined }) => (
        <Box component="span" sx={{ ml: 0.75, color: 'text.secondary', fontSize: '0.8em' }}>
            (/ {count || 0})
        </Box>
    );

    return (
        <>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} lg={4}>
                        <Stack spacing={2}>
                            {/* Campus */}
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="campus-select-label">キャンパス</InputLabel>
                                <Select value={searchOptions.campus} onChange={handleCampusChange} label="キャンパス">
                                    {campusSelectOptions.map((option) => (
                                        <MenuItem key={option} value={option} sx={{ justifyContent: 'space-between' }}>
                                            <span>{option}</span>
                                            <CountDisplay count={totalOptionCounts?.campus?.[option]} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="semester-select-label">セメスター</InputLabel>
                                <Select value={searchOptions.semester} onChange={handleSemesterChange} label="セメスター">
                                    {semesterSelectOptions.map((option) => (
                                        <MenuItem key={option} value={option} sx={{ justifyContent: 'space-between' }}>
                                            <span>{option}</span>
                                            <CountDisplay count={totalOptionCounts?.semester?.[option]} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="jiki-kubun-select-label">時期区分</InputLabel>
                                <Select value={searchOptions.jikiKubun} onChange={handleJikiKubunChange} label="時期区分">
                                    {jikiKubunSelectOptions.map((option) => (
                                        <MenuItem key={option} value={option} sx={{ justifyContent: 'space-between' }}>
                                            <span>{option}</span>
                                            <CountDisplay count={totalOptionCounts?.jikiKubun?.[option]} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="kamoku-kubun-select-label">科目区分</InputLabel>
                                <Select value={searchOptions.kamokuKubun} onChange={handleKamokuKubunChange} label="科目区分">
                                    {kamokuKubunSelectOptions.map((option) => (
                                        <MenuItem key={option} value={option} sx={{ justifyContent: 'space-between' }}>
                                            <span>{option}</span>
                                            <CountDisplay count={totalOptionCounts?.kamokuKubun?.[option]} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="language-select-label">使用言語</InputLabel>
                                <Select value={searchOptions.language} onChange={handleLanguageChange} label="使用言語">
                                    {languageSelectOptions.map((option) => (
                                        <MenuItem key={option} value={option} sx={{ justifyContent: 'space-between' }}>
                                            <span>{option}</span>
                                            <CountDisplay count={totalOptionCounts?.language?.[option]} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="course-type-select-label">学部／大学院</InputLabel>
                                <Select value={searchOptions.courseType} onChange={handleCourseTypeChange} label="学部／大学院">
                                    {courseTypeSelectOptions.map((option) => (
                                        <MenuItem key={option} value={option} sx={{ justifyContent: 'space-between' }}>
                                            <span>{option}</span>
                                            <CountDisplay count={totalOptionCounts?.courseType?.[option]} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Autocomplete
                                id="kaikou-bukyoku-autocomplete"
                                options={kaikouBukyokuFilteredOptions}
                                value={searchOptions.kaikouBukyoku}
                                onChange={handleKaikouBukyokuChange}
                                getOptionLabel={(option) => option}
                                isOptionEqualToValue={(option, value) => option === value}
                                renderInput={(params) => (
                                    <TextField {...params} label="開講部局" size="small" />
                                )}
                                renderOption={renderKaikouBukyokuOption}
                                sx={{ minWidth: 80 }}
                            />
                            <Box sx={{ minWidth: 80 }}>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item xs={7}>
                                        <FormControl fullWidth size="small" variant="outlined">
                                            <InputLabel id="rishu-nenji-select-label">年次</InputLabel>
                                            <Select value={searchOptions.rishuNenji as string} onChange={handleRishuNenjiChange} label="年次">
                                                {rishuNenjiSelectOptions.map((option) => (
                                                    <MenuItem key={option} value={option} sx={{ justifyContent: 'space-between' }}>
                                                        <span>{option === "指定なし" ? "指定なし" : `${option}年次`}</span>
                                                        <CountDisplay count={totalOptionCounts?.rishuNenji?.[String(option)]} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={5}>
                                        <FormControl fullWidth size="small" variant="outlined" disabled={searchOptions.rishuNenji === "指定なし"}>
                                            <InputLabel id="rishu-nenji-filter-select-label">条件</InputLabel>
                                            <Select value={searchOptions.rishuNenjiFilter} onChange={handleRishuNenjiFilterChange} label="条件">
                                                {rishuNenjiFilterOptions.map((option) => (
                                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6} lg={4}>
                        <Stack spacing={2}>
                            <TextField id="subject-name" label="授業科目名(部分一致)" variant="outlined" size="small" value={searchOptions.subjectName} onChange={(e) => setSearchOptions({ ...searchOptions, subjectName: e.target.value })} sx={{ minWidth: 80 }} />
                            <TextField id="teacher-name" label="担当教員名(部分一致)" variant="outlined" size="small" value={searchOptions.teacher} onChange={(e) => setSearchOptions({ ...searchOptions, teacher: e.target.value })} sx={{ minWidth: 80 }} />
                            <TextField id="subject-code" label="講義コード(前方一致)" variant="outlined" size="small" value={searchOptions.subjectCode} onChange={(e) => setSearchOptions({ ...searchOptions, subjectCode: e.target.value })} sx={{ minWidth: 80 }} />
                            <FormControl sx={{ minWidth: 80 }} size="small">
                                <InputLabel id="bookmark-filter-select-label">ブックマーク</InputLabel>
                                <Select value={searchOptions.bookmarkFilter} onChange={handleBookmarkFilterChange} label="ブックマーク">
                                    {bookmarkFilterOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Grid >

                    <Grid item xs={12} sm={12} lg={4}>
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
