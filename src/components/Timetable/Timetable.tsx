import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import React, { useContext, useMemo, useState } from 'react';

import {
  BookmarkContext,
  BookmarkContextType,
} from '../../contexts/BookmarkContext';
import { subject2Map } from '../../subject';
import { JikiKubun, komas, Subject2, youbis } from '../../types/subject'; // Subject2, semesters をインポート

// タイムテーブルのスロットのキーと授業配列のマッピングの型
type TimetableSlotData = {
  [key: string]: Subject2[]; // 例: { "月1": [subjectA], "火3": [subjectC] }
};

const displayTerms = ['１ターム', '２ターム', '３ターム', '４ターム', '集中'];

const timeByKoma: { [koma: number]: { start: string; end: string } } = {
  1: { start: '8:45', end: '10:15' },
  2: { start: '10:30', end: '12:00' },
  3: { start: '12:50', end: '14:20' },
  4: { start: '14:35', end: '16:05' },
  5: { start: '16:20', end: '17:50' },
  6: { start: '18:00', end: '19:30' },
  7: { start: '19:40', end: '21:10' },
};

const Timetable = () => {
  const [displayTerm, setDisplayTerm] = useState<JikiKubun>('１ターム'); // TODO: その時期に応じた初期値を設定する

  // ターム切り替え関数 (ToggleButtonGroup 用)
  const handleTermChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTerm: JikiKubun | null // 非選択状態もありうるため null を許容
  ) => {
    if (newTerm !== null) {
      // 新しいタームが選択された場合のみ更新
      setDisplayTerm(newTerm);
    }
  };

  const { bookmarkedSubjects } =
    useContext<BookmarkContextType>(BookmarkContext);

  // ★ データの前処理: 選択されたターム/セメスターに該当する授業をスロットにマッピング
  const timetableData = useMemo(() => {
    const data: TimetableSlotData = {};

    // TODO: 集中、年度、通年の扱い
    const isTermVisible = (
      scheduleJikiKubun: JikiKubun | undefined
    ): boolean => {
      if (!scheduleJikiKubun) return false;
      switch (scheduleJikiKubun) {
        case 'セメスター（前期）':
          return displayTerm === '１ターム' || displayTerm === '２ターム';
        case 'セメスター（後期）':
          return displayTerm === '３ターム' || displayTerm === '４ターム';
        case '集中':
        case '通年':
        case '年度':
        case 'ターム外（前期）':
        case 'ターム外（後期）':
          return displayTerm === '集中';
        default:
          return scheduleJikiKubun === displayTerm;
      }
    };

    Array.from(bookmarkedSubjects).forEach((subjectCode) => {
      const subject = subject2Map[subjectCode];
      const schedules = subject['授業時間・講義室'];
      if (!schedules) return;

      schedules.forEach((schedule) => {
        // 曜日/コマ情報があり、選択中の表示タームに含まれるスケジュールのみ処理
        if (
          schedule.jigen &&
          schedule.jigen.komaRange &&
          isTermVisible(schedule.jikiKubun)
        ) {
          const startKoma = schedule.jigen.komaRange.begin;
          const endKoma = schedule.jigen.komaRange.last;
          const youbi = schedule.jigen.youbi;

          // 授業が該当するすべてのコマ (koma) に Subject 情報を追加
          for (let k = startKoma; k <= endKoma; k++) {
            const key = `${youbi}${k}`;
            if (!data[key]) {
              data[key] = [];
            }
            // 同じ授業が重複しないようにチェック
            if (!data[key].some((s) => s.講義コード === subject.講義コード)) {
              // 必要ならここで schedule.jikiKubun なども付与して描画時に使えるようにする TODO: どゆこと？
              data[key].push(subject);
            }
          }
        }
      });
    });
    return data;
  }, [bookmarkedSubjects, displayTerm]);

  return (
    <Box
      className="timetable"
      sx={{
        position: 'fixed',
        bottom: { xs: 80, sm: 100 },
        right: { xs: 16, sm: 32 },
        left: { xs: 16, sm: 'auto' },
        width: { xs: 'calc(100% - 32px)', sm: '400px' },
        maxWidth: { xs: 'calc(100% - 32px)', sm: '400px' },
        maxHeight: { xs: '60vh', sm: '440px' },
        height: { xs: 'auto', sm: '440px' },
        zIndex: (theme) => theme.zIndex.drawer - 1,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        opacity: 0.95,
        boxShadow: 4,
        overflow: 'auto',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: 1,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <ToggleButtonGroup
          color="primary"
          value={displayTerm}
          exclusive
          onChange={handleTermChange}
          aria-label="Term selection"
          size="small"
        >
          {displayTerms.map((t) => (
            <ToggleButton
              key={t}
              value={t}
              sx={{ padding: '2px 8px', fontSize: '0.75rem' }}
            >
              {t}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ flexGrow: 1, overflow: 'auto' }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{ tableLayout: 'fixed', minWidth: 300 }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                component="th"
                sx={{
                  width: '40px',
                  backgroundColor: 'background.paper',
                  borderColor: 'divider',
                  zIndex: (theme) => theme.zIndex.appBar + 1,
                }}
              ></TableCell>{' '}
              {/* 左上角 */}
              {youbis.map((youbi) => (
                <TableCell
                  component="th"
                  key={youbi}
                  align="center"
                  sx={{
                    backgroundColor: 'background.paper',
                    borderColor: 'divider',
                    zIndex: (theme) => theme.zIndex.appBar + 1,
                  }}
                >
                  {youbi}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {komas.map((koma) => (
              <TableRow key={koma} sx={{ height: 50 }}>
                <TableCell
                  component="th"
                  scope="row"
                  align="center"
                  sx={{
                    verticalAlign: 'top',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    p: 0.5,
                  }}
                >
                  <Stack spacing={0.1} alignItems="center">
                    <Typography variant="body2">{koma}</Typography>
                    {timeByKoma[koma]?.start && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.6rem',
                          opacity: 0.75,
                          lineHeight: 1.0,
                        }}
                      >
                        {timeByKoma[koma].start}
                      </Typography>
                    )}
                    {timeByKoma[koma]?.end && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.6rem',
                          opacity: 0.75,
                          lineHeight: 1.0,
                        }}
                      >
                        {timeByKoma[koma].end}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                {youbis.map((youbi) => {
                  const key = `${youbi}${koma}`;
                  const subjectsInSlot = timetableData[key] || [];

                  // --- ★ rowSpan 処理はまだ未実装 ---
                  // ここで、上のコマから続いている授業かチェックし、
                  // もしそうなら return null; するロジックが必要

                  return (
                    <TableCell
                      key={key}
                      sx={{
                        verticalAlign: 'top',
                        p: 0.2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack spacing={0.2}>
                        {subjectsInSlot.map((subject) => (
                          // ★ Paper で授業ブロックを表現
                          <Paper
                            key={subject.講義コード}
                            elevation={0}
                            variant="outlined"
                            sx={{
                              p: 0.3,
                              overflow: 'hidden',
                              backgroundColor:
                                subject['時期区分'] === 'セメスター（前期）' ||
                                subject['時期区分'] === 'セメスター（後期）'
                                  ? 'lightblue'
                                  : 'lightgreen',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.2,
                                fontSize: '0.45rem',
                                cursor: 'pointer',
                              }}
                              title={subject.授業科目名} // ホバーでフルネーム表示
                              // TODO: クリックで授業詳細モーダルを開く？
                              // onClick={() => handleSubjectClick(subject)}
                            >
                              {subject.授業科目名}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Timetable;
