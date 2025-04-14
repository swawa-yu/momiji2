import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Subject2 } from '../../types/subject';
import BookmarkButton from './BookmarkButton';
import { convertURLtoAbsolute } from '../../subject/utils';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';

interface ReactTableComponentProps {
    subjectsToShow: Subject2[];
}

const addIdToRows = (rows: Subject2[]) => {
    return rows.map((row) => ({
        ...row,
        id: row.講義コード,
    }));
};

const ReactTableComponent: React.FC<ReactTableComponentProps> = React.memo(({ subjectsToShow }) => {
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');

    const handleCopyToClipboard = async (text: string, event: React.MouseEvent) => {
        event.stopPropagation(); // DataGridの行クリックイベントなどを抑制
        try {
            await navigator.clipboard.writeText(text);
            setSnackbarMessage(`「${text}」をコピーしました`);
            setSnackbarOpen(true);
            console.log('Copied to clipboard:', text);
        } catch (err) {
            setSnackbarMessage(`コピーに失敗しました`);
            setSnackbarOpen(true);
            console.error('Failed to copy text: ', err);
        }
    };

    const handleSnackbarClose = () => { // フィードバック用
        setSnackbarOpen(false);
    };


    const columns: GridColDef[] = [
        {
            // ブックマークボタン用の列
            field: 'actions',
            headerName: '☆',
            width: 50,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,

            renderCell: (params: GridRenderCellParams<Subject2>) => (
                <BookmarkButton lectureCode={params.row.講義コード} />
            ),
        },
        {
            field: '授業科目名',
            headerName: '講義コード・授業科目名',
            width: 250,
            minWidth: 200,
            sortable: false,
            renderCell: (params: GridRenderCellParams<Subject2>) => {
                const code = params.row.講義コード;
                const name = params.row.授業科目名;
                const url = convertURLtoAbsolute(params.row["relative URL"]);

                return (
                    <Box sx={{
                        // width: '100%',
                        // height: '100%',
                        // display: 'flex',
                        // flexDirection: 'column',
                        // justifyContent: 'center',
                        overflow: 'hidden',
                    }}>
                        {/* 1行目: 講義コード + コピーボタン */}
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            {/* 講義コード (リンク) */}
                            <Tooltip title="新しいタブでシラバスを開く" arrow>
                                <Typography
                                    component="a" // aタグとしてレンダリング
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontSize: '1em',
                                        color: 'inherit',
                                        textDecoration: 'underline',
                                        minWidth: 0, // これがないと縮小時にellipsisが効かないことがある
                                    }}
                                >
                                    {code}
                                </Typography>
                            </Tooltip>

                            {/* コピーボタン */}
                            <Tooltip title="講義コードをコピー" arrow>
                                <IconButton
                                    aria-label="講義コードをコピー"
                                    onClick={(e) => handleCopyToClipboard(code, e)}
                                    size="small"
                                    sx={{ p: '2px', ml: 0.5 }}
                                >
                                    <ContentCopyIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* 2行目: 授業科目名 */}
                        <Tooltip title={name} arrow>
                            <Typography
                                component="div"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontSize: '1em',
                                    width: '100%',
                                    mt: 0.
                                }}
                            >
                                {name}
                            </Typography>
                        </Tooltip>
                    </Box>
                );
            },
        },
        {
            field: '担当教員名',
            headerName: '教員',
            width: 75,
            sortable: false,
            renderCell: (params: GridRenderCellParams<Subject2>) => {
                return (
                    <Box sx={{ maxHeight: '60px', overflowY: 'auto', width: '100%' }}>
                        {params.row.担当教員名.map((teacher, index) => {
                            if (teacher === "担当教員未定") {
                                return (
                                    <Typography key={index} component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                                        {teacher}
                                    </Typography>
                                )
                            }

                            const query = encodeURIComponent(teacher.split(' ').join(' '));
                            const researchMapUrl = `https://researchmap.jp/researchers?q=${query}`;
                            return (
                                <Typography key={index} component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                                    <Tooltip title={`researchmapで「${teacher}」を検索`} arrow>
                                        <a href={researchMapUrl} target="_blank" rel="noopener noreferrer">{teacher}</a>
                                    </Tooltip>
                                </Typography>
                            );
                        })}
                    </Box>
                );
            },
        },
        {
            field: '開設期', headerName: '開設期', width: 110, sortable: false,
            renderCell: (params: GridRenderCellParams<Subject2>) => {
                const kaisetsuki = params.row.開設期.replace("（", "(").replace("）", ")");
                const parts = kaisetsuki.split(' ');

                return (
                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Typography component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8em' }}>
                            {parts[0] + ' ' + parts[1]}
                        </Typography>
                        <Typography component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8em' }}>
                            {parts[2]}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            field: '曜日・時限・講義室', headerName: '曜日・時限・講義室', width: 160, sortable: false,
            renderCell: (params: GridRenderCellParams<Subject2>) => {
                const schedules = params.row.曜日・時限・講義室.split(',');
                return (
                    <Box sx={{ maxHeight: '60px', overflowY: 'auto', width: '100%' }}>
                        {schedules.map((schedule, index) => (
                            <Typography key={index} component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8em' }}>
                                {schedule}
                            </Typography>
                        ))}
                    </Box>
                );
            }
        },
        {
            field: 'campusLang',
            headerName: 'キャンパス・言語',
            width: 110,
            sortable: false,
            renderCell: (params: GridRenderCellParams<Subject2>) => {
                const campus = params.row.開講キャンパス;
                const language = params.row.使用言語;
                const fullText = `${campus} / ${language}`;

                return (
                    <Tooltip title={fullText} arrow>
                        <Box sx={{
                            width: '100%',
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            fontSize: '0.8em'
                        }}>
                            <Typography component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'inherit' }}>
                                {campus}
                            </Typography>
                            <Typography component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'inherit' }}>
                                {language}
                            </Typography>
                        </Box>
                    </Tooltip>
                );
            },
        },
        {
            field: '授業の目標・概要等',
            headerName: '概要',
            flex: 1,
            minWidth: 350,
            sortable: false,
            renderCell: (params: GridRenderCellParams<Subject2>) => (
                <Tooltip title={params.value || ''} arrow>
                    <Typography component="div" sx={{
                        width: '100%',
                        height: '100%',
                        whiteSpace: 'normal',
                        overflowY: 'auto',
                        fontSize: '0.8em',
                        lineHeight: 1.3
                    }}>
                        {params.value}
                    </Typography>

                </Tooltip>
            ),
        },
    ];

    const rowsWithId = React.useMemo(() => addIdToRows(subjectsToShow), [subjectsToShow]);

    return (
        <Box sx={{ width: '100%' }}>
            <DataGrid
                rows={rowsWithId}
                columns={columns}
                rowHeight={80}
                pageSizeOptions={[10, 25, 50, 100]}
                density="compact"
                sx={{
                    '& .MuiDataGrid-cell': {
                        padding: '4px 3px',
                        verticalAlign: 'top',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'flex-start',
                    },
                    '& .MuiDataGrid-columnHeader': {
                        padding: '0 8px',
                    },
                    border: 1,
                    borderColor: 'divider'
                }}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 100 },
                    },
                }}
            />
            {/* フィードバック用 Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000} // 2秒で消える
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </Box>
    );
});

export default ReactTableComponent;