import { useState, useEffect } from 'react';
import { initializeSubject } from './subject';
import SearchComponent from './components/SearchComponent';
import ExportBookmarkButton from './components/ExportBookmarkButton';
import TableView from './components/TableView';
import Timetable from './components/Timetable';
import { SearchOptions } from './types/search';
import { initialSearchOptions } from './search/';
import { BookmarkProvider } from './contexts/BookmarkContext';

// --- MUI Imports ---
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import InfoIcon from '@mui/icons-material/Info';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';


function App() {
    initializeSubject();

    const [searchOptions, setSearchOptions] = useState<SearchOptions>(initialSearchOptions);
    const [theme, setTheme] = useState<'light' | 'dark'>(
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const handleInfoDialogOpen = () => {
        setInfoDialogOpen(true);
    };
    const handleInfoDialogClose = () => {
        setInfoDialogOpen(false);
    };

    const [isTimetableVisible, setIsTimetableVisible] = useState(false);
    const toggleTimetable = () => {
        setIsTimetableVisible(prev => !prev);
    };

    useEffect(() => {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
    }, [theme]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <BookmarkProvider>
                <AppBar position="sticky">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ letterSpacing: -0.5 }}>
                            広島大学シラバス momiji2
                        </Typography>

                        {/* ↓ 右寄せ用のスペーサー */}
                        <Box sx={{ flexGrow: 1 }} />

                        <ExportBookmarkButton />

                        <Tooltip title="ライト/ダークモード切替">
                            <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                                {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="このアプリについて">
                            <IconButton sx={{ ml: 1 }} color="inherit" onClick={handleInfoDialogOpen}>
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
                    <DialogTitle id="info-dialog-title">
                        このアプリについて
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText component="div" sx={{ '& ul': { pl: 2, mt: 0.5 }, '& li': { mb: 0.5 } }}>
                            <Typography variant="h6" component="h3" gutterBottom>開発者</Typography>
                            <Typography component="span">
                                GitHub: <Link href='https://github.com/swawa-yu' target="_blank" rel="noopener noreferrer">swawa-yu</Link> (リポジトリ：<Link href='https://github.com/swawa-yu/momiji2' target="_blank" rel="noopener noreferrer">swawa-yu/momiji2</Link>)
                            </Typography>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleInfoDialogClose} autoFocus> {/* autoFocus で Enter でも閉じれる */}
                            閉じる
                        </Button>
                    </DialogActions>
                </Dialog>

                <Container maxWidth="xl" sx={{ mt: 2, mb: 2, flexGrow: 1 }}>
                    <Box sx={{ mb: 3 }}>
                        <Alert severity="warning" sx={{ mb: 1 }}>
                            <strong>【重要】</strong>最新のシラバス情報はMyもみじから確認してください！！
                        </Alert>
                        <Alert severity="info" sx={{ mb: 1 }}>
                            2025年4月3日時点での<a href='https://momiji.hiroshima-u.ac.jp/syllabusHtml/'>広島大学シラバス</a>のデータに基づきます。
                        </Alert>
                    </Box>

                    <SearchComponent searchOptions={searchOptions} setSearchOptions={setSearchOptions} />

                    <TableView searchOptions={searchOptions} />
                </Container>
                <Timetable />
                <Fab
                    color="primary"
                    aria-label="時間割 表示/非表示"
                    onClick={toggleTimetable}
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                    }}
                >
                    <CalendarMonthIcon />
                </Fab>
            </BookmarkProvider>
        </Box>
    );
}

export default App;