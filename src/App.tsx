import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoIcon from '@mui/icons-material/Info';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useDeferredValue, useState } from 'react';

import ExportBookmarkButton from './components/ExportBookmarkButton';
import SearchComponent from './components/SearchComponent';
import TableView from './components/TableView';
import Timetable from './components/Timetable';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { initialSearchOptions } from './search/';
import { initializeSubject } from './subject';
import { SearchOptions } from './types/search';

function App() {
  initializeSubject();

  const [searchOptions, setSearchOptions] =
    useState<SearchOptions>(initialSearchOptions);

  const deferredSearchOptions = useDeferredValue(searchOptions);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const handleInfoDialogOpen = () => setInfoDialogOpen(true);
  const handleInfoDialogClose = () => setInfoDialogOpen(false);
  const [isTimetableVisible, setIsTimetableVisible] = useState(false);
  const toggleTimetable = () => setIsTimetableVisible((prev) => !prev);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <BookmarkProvider>
        <AppBar position="sticky">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ letterSpacing: -0.5 }}
            >
              広島大学シラバス momiji2
            </Typography>

            {/* ↓ 右寄せ用のスペーサー */}
            <Box sx={{ flexGrow: 1 }} />

            <ExportBookmarkButton />

            <Tooltip title="このアプリについて">
              <IconButton
                sx={{ ml: 1 }}
                color="inherit"
                onClick={handleInfoDialogOpen}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Dialog
          open={infoDialogOpen}
          onClose={handleInfoDialogClose}
          aria-labelledby="info-dialog-title"
        >
          <DialogTitle id="info-dialog-title">このアプリについて</DialogTitle>
          <DialogContent>
            <DialogContentText
              component="div"
              sx={{
                '& ul': { pl: 2, mt: 0.5 },
                '& li': { mb: 0.5 },
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom>
                開発者
              </Typography>
              <Typography component="span">
                GitHub:{' '}
                <Link
                  href="https://github.com/swawa-yu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  swawa-yu
                </Link>{' '}
                (リポジトリ：
                <Link
                  href="https://github.com/swawa-yu/momiji2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  swawa-yu/momiji2
                </Link>
                )
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleInfoDialogClose} autoFocus>
              {' '}
              {/* autoFocus で Enter でも閉じれる */}
              閉じる
            </Button>
          </DialogActions>
        </Dialog>

        <Container
          maxWidth="xl"
          sx={{
            mt: 2,
            mb: 2,
            flexGrow: 1,
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Alert severity="warning" sx={{ mb: 1 }}>
              <strong>【重要】</strong>
              最新のシラバス情報はMyもみじから確認してください！！
            </Alert>
            <Alert severity="info" sx={{ mb: 1 }}>
              2026年4月1日時点での
              <a href="https://momiji.hiroshima-u.ac.jp/syllabusHtml/">
                広島大学シラバス
              </a>
              のデータに基づきます。
            </Alert>
          </Box>

          <SearchComponent
            searchOptions={searchOptions}
            setSearchOptions={setSearchOptions}
          />

          <TableView searchOptions={deferredSearchOptions} />
        </Container>
        {isTimetableVisible && <Timetable />}

        {/* TODO: 非表示状態の時、ブックマーク追加時に目を引くようにする */}
        <Fab
          color="primary"
          aria-label="時間割 表示/非表示"
          onClick={toggleTimetable}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 32 },
            right: { xs: 16, sm: 32 },
            zIndex: (theme) => theme.zIndex.tooltip,
          }}
        >
          <CalendarMonthIcon />
        </Fab>
      </BookmarkProvider>

      <Box
        component="footer"
        sx={{
          mt: 'auto',
          p: 2,
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          height: '60px',
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          © 2025 swawa_yu - momiji2
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
