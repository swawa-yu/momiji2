import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, {
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  BookmarkContext,
  BookmarkContextType,
} from '../../contexts/BookmarkContext';
import {
  calculateAllOptionCounts,
  FilterCounts,
  initialSearchOptions,
} from '../../search';
import { totalOptionCounts } from '../../subject';
import { SearchOptions, YoubiKomaSelected } from '../../types/search';
import {
  bookmarkFilterOptions,
  campusSelectOptions,
  courseTypeSelectOptions,
  jikiKubunSelectOptions,
  kaikouBukyokuDaigakuinSelectOptions,
  kaikouBukyokuGakubuSelectOptions,
  kaikouBukyokuSelectOptions,
  kamokuKubunSelectOptions,
  languageSelectOptions,
  rishuNenjiFilterOptions,
  rishuNenjiSelectOptions,
  semesterSelectOptions,
} from '../../types/subject';
import KomaSelector from './KomaSelector';

type SearchComponentProps = {
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  searchOptions: SearchOptions;
};

// TODO: あいまい検索に対応(generalSearch)
const SearchComponent: React.FC<SearchComponentProps> = ({
  searchOptions,
  setSearchOptions,
}: SearchComponentProps) => {
  const [filterCounts, setFilterCounts] = useState<FilterCounts | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { bookmarkedSubjects } =
    useContext<BookmarkContextType>(BookmarkContext);

  useEffect(() => {
    setIsCalculating(true);
    startTransition(() => {
      const newCounts = calculateAllOptionCounts(
        searchOptions,
        bookmarkedSubjects
      );
      setFilterCounts(newCounts);
      setIsCalculating(false);
    });
  }, [searchOptions, bookmarkedSubjects]);

  const handleClear = () => {
    setSearchOptions(initialSearchOptions);
  };

  const handleYoubiKomaChange = (newYoubiKoma: YoubiKomaSelected) => {
    setSearchOptions((prevOptions) => ({
      ...prevOptions,
      youbiKoma: newYoubiKoma,
    }));
  };
  const handleCampusChange = (event: SelectChangeEvent) => {
    setSearchOptions((prevOptions) => ({
      ...prevOptions,
      campus: event.target.value as SearchOptions['campus'],
    }));
  };
  const handleSemesterChange = (event: SelectChangeEvent) => {
    setSearchOptions((prevOptions) => ({
      ...prevOptions,
      semester: event.target.value as SearchOptions['semester'],
    }));
  };
  const handleJikiKubunChange = (event: SelectChangeEvent) => {
    setSearchOptions((prevOptions) => ({
      ...prevOptions,
      jikiKubun: event.target.value as SearchOptions['jikiKubun'],
    }));
  };
  const handleKamokuKubunChange = (event: SelectChangeEvent) => {
    setSearchOptions((prevOptions) => ({
      ...prevOptions,
      kamokuKubun: event.target.value as SearchOptions['kamokuKubun'],
    }));
  };
  const handleLanguageChange = (event: SelectChangeEvent) => {
    setSearchOptions((prevOptions) => ({
      ...prevOptions,
      language: event.target.value as SearchOptions['language'],
    }));
  };
  const handleCourseTypeChange = (event: SelectChangeEvent) => {
    const newCourseType = event.target.value as SearchOptions['courseType'];
    setSearchOptions((prevOptions) => ({
      ...prevOptions,
      courseType: newCourseType,
      kaikouBukyoku: '指定なし',
    }));
  };
  const handleKaikouBukyokuChange = (
    _event: React.SyntheticEvent,
    newValue: SearchOptions['kaikouBukyoku'] | null
  ) => {
    setSearchOptions((prevOptions) => ({
      ...prevOptions,
      kaikouBukyoku: newValue ?? '指定なし',
    }));
  };
  const handleRishuNenjiChange = (event: SelectChangeEvent) => {
    setSearchOptions((prevOptions) => ({
      ...prevOptions,
      rishuNenji: event.target.value as SearchOptions['rishuNenji'],
    }));
  };
  const handleRishuNenjiFilterChange = (event: SelectChangeEvent) => {
    setSearchOptions((prevOptions) => ({
      ...prevOptions,
      rishuNenjiFilter: event.target.value as SearchOptions['rishuNenjiFilter'],
    }));
  };
  const handleBookmarkFilterChange = (event: SelectChangeEvent) => {
    setSearchOptions((prevOptions) => ({
      ...prevOptions,
      bookmarkFilter: event.target.value as SearchOptions['bookmarkFilter'],
    }));
  };
  const handleSubjectNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchOptions((prev) => ({
      ...prev,
      subjectName: event.target.value,
    }));
  };
  const handleTeacherChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchOptions((prev) => ({ ...prev, teacher: event.target.value }));
  };
  const handleSubjectCodeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchOptions((prev) => ({
      ...prev,
      subjectCode: event.target.value,
    }));
  };

  const kaikouBukyokuFilteredOptions = useMemo(() => {
    switch (searchOptions.courseType) {
      case '学部':
        return kaikouBukyokuGakubuSelectOptions;
      case '大学院':
        return kaikouBukyokuDaigakuinSelectOptions;
      default:
        return kaikouBukyokuSelectOptions;
    }
  }, [searchOptions.courseType]);

  const renderKaikouBukyokuOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: string
  ) => {
    const numerator =
      filterCounts?.kaikouBukyoku?.[option] ?? (isCalculating ? '...' : 0);
    const denominator = totalOptionCounts?.kaikouBukyoku?.[option] || 0;
    const label = option;
    return (
      <li {...props}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Typography
            variant="body2"
            component="span"
            sx={{
              flexGrow: 1,
              mr: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            sx={{
              color: 'text.secondary',
              fontSize: '0.8em',
              flexShrink: 0,
            }}
          >
            ({numerator} / {denominator})
          </Typography>
        </Box>
      </li>
    );
  };

  return (
    <>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 3,
          position: 'relative',
        }}
      >
        {isCalculating && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              zIndex: 10,
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="caption" sx={{ ml: 1 }}>
              件数計算中...
            </Typography>
          </Box>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={4}>
            <Stack spacing={2}>
              <FormControl sx={{ minWidth: 80 }} size="small">
                <InputLabel id="campus-select-label">キャンパス</InputLabel>
                <Select
                  value={searchOptions.campus}
                  onChange={handleCampusChange}
                  label="キャンパス"
                  renderValue={(value) => value}
                >
                  {campusSelectOptions.map((option) => {
                    const numerator =
                      filterCounts?.campus?.[option] ??
                      (isCalculating ? '...' : 0);
                    const denominator =
                      totalOptionCounts?.campus?.[option] || 0;
                    return (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{option}</span>
                        <Box
                          component="span"
                          sx={{
                            ml: 0.75,
                            color: 'text.secondary',
                            fontSize: '0.8em',
                          }}
                        >
                          ({numerator} / {denominator})
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 80 }} size="small">
                <InputLabel id="semester-select-label">セメスター</InputLabel>
                <Select
                  value={searchOptions.semester}
                  onChange={handleSemesterChange}
                  label="セメスター"
                  renderValue={(value) => value}
                >
                  {semesterSelectOptions.map((option) => {
                    const numerator =
                      filterCounts?.semester?.[option] ??
                      (isCalculating ? '...' : 0);
                    const denominator =
                      totalOptionCounts?.semester?.[option] || 0;
                    return (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{option}</span>
                        <Box
                          component="span"
                          sx={{
                            ml: 0.75,
                            color: 'text.secondary',
                            fontSize: '0.8em',
                          }}
                        >
                          ({numerator} / {denominator})
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 80 }} size="small">
                <InputLabel id="jiki-kubun-select-label">時期区分</InputLabel>
                <Select
                  value={searchOptions.jikiKubun}
                  onChange={handleJikiKubunChange}
                  label="時期区分"
                  renderValue={(value) => value}
                >
                  {jikiKubunSelectOptions.map((option) => {
                    const numerator =
                      filterCounts?.jikiKubun?.[option] ??
                      (isCalculating ? '...' : 0);
                    const denominator =
                      totalOptionCounts?.jikiKubun?.[option] || 0;
                    return (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{option}</span>
                        <Box
                          component="span"
                          sx={{
                            ml: 0.75,
                            color: 'text.secondary',
                            fontSize: '0.8em',
                          }}
                        >
                          ({numerator} / {denominator})
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 80 }} size="small">
                <InputLabel id="kamoku-kubun-select-label">科目区分</InputLabel>
                <Select
                  value={searchOptions.kamokuKubun}
                  onChange={handleKamokuKubunChange}
                  label="科目区分"
                  renderValue={(value) => value}
                >
                  {kamokuKubunSelectOptions.map((option) => {
                    const numerator =
                      filterCounts?.kamokuKubun?.[option] ??
                      (isCalculating ? '...' : 0);
                    const denominator =
                      totalOptionCounts?.kamokuKubun?.[option] || 0;
                    return (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{option}</span>
                        <Box
                          component="span"
                          sx={{
                            ml: 0.75,
                            color: 'text.secondary',
                            fontSize: '0.8em',
                          }}
                        >
                          ({numerator} / {denominator})
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 80 }} size="small">
                <InputLabel id="language-select-label">使用言語</InputLabel>
                <Select
                  value={searchOptions.language}
                  onChange={handleLanguageChange}
                  label="使用言語"
                  renderValue={(value) => value}
                >
                  {languageSelectOptions.map((option) => {
                    const numerator =
                      filterCounts?.language?.[option] ??
                      (isCalculating ? '...' : 0);
                    const denominator =
                      totalOptionCounts?.language?.[option] || 0;
                    return (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{option}</span>
                        <Box
                          component="span"
                          sx={{
                            ml: 0.75,
                            color: 'text.secondary',
                            fontSize: '0.8em',
                          }}
                        >
                          ({numerator} / {denominator})
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 80 }} size="small">
                <InputLabel id="course-type-select-label">
                  学部／大学院
                </InputLabel>
                <Select
                  value={searchOptions.courseType}
                  onChange={handleCourseTypeChange}
                  label="学部／大学院"
                  renderValue={(value) => value}
                >
                  {courseTypeSelectOptions.map((option) => {
                    const numerator =
                      filterCounts?.courseType?.[option] ??
                      (isCalculating ? '...' : 0);
                    const denominator =
                      totalOptionCounts?.courseType?.[option] || 0;
                    return (
                      <MenuItem
                        key={option}
                        value={option}
                        sx={{
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{option}</span>
                        <Box
                          component="span"
                          sx={{
                            ml: 0.75,
                            color: 'text.secondary',
                            fontSize: '0.8em',
                          }}
                        >
                          ({numerator} / {denominator})
                        </Box>
                      </MenuItem>
                    );
                  })}
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
                      <InputLabel id="rishu-nenji-select-label">
                        年次
                      </InputLabel>
                      <Select
                        value={searchOptions.rishuNenji as string}
                        onChange={handleRishuNenjiChange}
                        label="年次"
                        renderValue={(value) =>
                          value === '指定なし' ? '指定なし' : `${value}年次`
                        }
                      >
                        {rishuNenjiSelectOptions.map((option) => {
                          const numerator =
                            filterCounts?.rishuNenji?.[String(option)] ??
                            (isCalculating ? '...' : 0);
                          const denominator =
                            totalOptionCounts?.rishuNenji?.[String(option)] ||
                            0;
                          return (
                            <MenuItem
                              key={option}
                              value={option}
                              sx={{
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>
                                {option === '指定なし'
                                  ? '指定なし'
                                  : `${option}年次`}
                              </span>
                              <Box
                                component="span"
                                sx={{
                                  ml: 0.75,
                                  color: 'text.secondary',
                                  fontSize: '0.8em',
                                }}
                              >
                                ({numerator} / {denominator})
                              </Box>
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={5}>
                    <FormControl
                      fullWidth
                      size="small"
                      variant="outlined"
                      disabled={searchOptions.rishuNenji === '指定なし'}
                    >
                      <InputLabel id="rishu-nenji-filter-select-label">
                        条件
                      </InputLabel>
                      <Select
                        value={searchOptions.rishuNenjiFilter}
                        onChange={handleRishuNenjiFilterChange}
                        label="条件"
                      >
                        {rishuNenjiFilterOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
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
              <TextField
                id="subject-name"
                label="授業科目名(部分一致)"
                variant="outlined"
                size="small"
                value={searchOptions.subjectName}
                onChange={handleSubjectNameChange}
                sx={{ minWidth: 80 }}
              />
              <TextField
                id="teacher-name"
                label="担当教員名(部分一致)"
                variant="outlined"
                size="small"
                value={searchOptions.teacher}
                onChange={handleTeacherChange}
                sx={{ minWidth: 80 }}
              />
              <TextField
                id="subject-code"
                label="講義コード(前方一致)"
                variant="outlined"
                size="small"
                value={searchOptions.subjectCode}
                onChange={handleSubjectCodeChange}
                sx={{ minWidth: 80 }}
              />
              <FormControl sx={{ minWidth: 80 }} size="small">
                <InputLabel id="bookmark-filter-select-label">
                  ブックマーク
                </InputLabel>
                <Select
                  value={searchOptions.bookmarkFilter}
                  onChange={handleBookmarkFilterChange}
                  label="ブックマーク"
                >
                  {bookmarkFilterOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={12} lg={4}>
            <KomaSelector onSelectionChange={handleYoubiKomaChange} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={handleClear}
          >
            検索条件をクリア
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default SearchComponent;
