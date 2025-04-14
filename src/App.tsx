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

function App() {
    initializeSubject();

    const [searchOptions, setSearchOptions] = useState<SearchOptions>(initialSearchOptions);
    const [theme, setTheme] = useState<'light' | 'dark'>(
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
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
                    </Toolbar>
                </AppBar>

                <Container maxWidth="xl" sx={{ mt: 2, mb: 2, flexGrow: 1 }}>
                    <Box sx={{ mb: 3 }}>
                        <Alert severity="warning" sx={{ mb: 1 }}>
                            <strong>【重要】</strong>最新のシラバス情報はMyもみじから確認してください！！
                        </Alert>
                        <Alert severity="info" sx={{ mb: 1 }}>
                            2025年4月3日時点での<a href='https://momiji.hiroshima-u.ac.jp/syllabusHtml/'>広島大学シラバス</a>のデータに基づきます。
                        </Alert>
                        {/* 開発者情報はフッターや別ページが良いかもしれないが、一旦ここに残す */}
                        <h2>開発者 (連絡先...バグ報告等はこちらまで)</h2>
                        <ul>
                            <li>
                                <i className="fab fa-github"></i> GitHub: <a href='https://github.com/swawa-yu'>swawa-yu</a> (リポジトリ：<a href='https://github.com/swawa-yu/momiji2'>swawa-yu/momiji2</a>)
                            </li>
                            {/* <li>Twitter: <a href='https://twitter.com/swawa_yu'>@swawa_yu</a>, <a href='https://twitter.com/archaic_hohoemi'>@archaic_hohoemi</a></li> */}
                        </ul>
                    </Box>

                    <SearchComponent searchOptions={searchOptions} setSearchOptions={setSearchOptions} />

                    <TableView searchOptions={searchOptions} />
                </Container>
                <Timetable />
            </BookmarkProvider>
        </Box>
    );
}

export default App;