import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Subject2 } from '../../types/subject';
import BookmarkButton from './BookmarkButton';
import { convertURLtoAbsolute } from '../../subject/utils';
import Typography from '@mui/material/Typography';

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

    const columns: GridColDef[] = [
        {
            // ブックマークボタン用の列
            field: 'actions', // データにない操作用の列なので、適当な field 名を付ける
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
                const fullText = `${code} ${name}`;

                return (
                    <Tooltip title={fullText} arrow>
                        <Box sx={{
                            width: '100%',
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                        }}>
                            {/* 1行目: 講義コード */}
                            <Typography component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <a href={url} target="_blank" rel="noopener noreferrer" title="新しいタブでシラバスを開く"
                                    style={{ color: 'inherit', textDecoration: 'underline', fontSize: '0.8em' }} // スタイル調整
                                >
                                    {code}
                                </a>
                            </Typography>

                            {/* 2行目: 授業科目名 */}
                            <Typography component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '1em' }}>
                                {name}
                            </Typography>

                            {/* <br /> は削除 */}
                        </Box>
                    </Tooltip>
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
            width: 350,
            minWidth: 350,
            sortable: false,
            renderCell: (params: GridRenderCellParams<Subject2>) => (
                <Tooltip title={params.value || ''} arrow>
                    <Typography component="div" sx={{
                        width: '100%',
                        height: '100%',
                        whiteSpace: 'normal',
                        overflow: 'scroll',
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
        <Box>
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
                }}
            />
        </Box>
    );
});

export default ReactTableComponent;