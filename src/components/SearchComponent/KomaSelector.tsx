import React, { useState } from 'react';
import './KomaSelector.css';
import { Youbi, Koma, YoubiKoma, youbis, komas, komaTime } from '../../types/subject';
import { YoubiKomaSelected, } from '../../types/search';
import { initializeYoubiKoma } from '../../search';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

type KomaSelectorProps = {
    onSelectionChange: (youbiKomaSelected: YoubiKomaSelected) => void;
};

const KomaSelector: React.FC<KomaSelectorProps> = ({ onSelectionChange: onScheduleChange }) => {
    // 初期状態で全ての曜日とコマをtrueに設定
    const [youbiKoma, setYoubiKoma] = useState<YoubiKomaSelected>(initializeYoubiKoma(true));


    const handleYoubiKomaCheckboxChange = (key: YoubiKoma, checked: boolean) => {
        const newSchedule = { ...youbiKoma, [key]: checked };
        setYoubiKoma(newSchedule);
        onScheduleChange(newSchedule);
    };

    const setAllYoubi = (youbi: Youbi, newCheckState: boolean) => {
        const newSchedule = { ...youbiKoma };
        komas.forEach(koma => {
            newSchedule[`${youbi}${koma}`] = newCheckState;
        });
        setYoubiKoma(newSchedule);
        onScheduleChange(newSchedule);
    }

    const setAllKoma = (koma: Koma, newCheckState: boolean) => {
        const newSchedule = { ...youbiKoma };
        youbis.forEach(youbi => {
            newSchedule[`${youbi}${koma}`] = newCheckState;
        });
        setYoubiKoma(newSchedule);
        onScheduleChange(newSchedule);
    }

    const setAllYoubiKoma = (newCheckState: boolean) => {
        const newSchedule = { ...youbiKoma };
        youbis.forEach(youbi => {
            komas.forEach(koma => {
                newSchedule[`${youbi}${koma}`] = newCheckState;
            });
        });
        newSchedule["集中"] = newCheckState;
        newSchedule["その他"] = newCheckState;
        setYoubiKoma(newSchedule);
        onScheduleChange(newSchedule);
    };

    return (
        <div className='koma-selector'>
            <Button size="small" variant="text" onClick={() => setAllYoubiKoma(true)}>全て選択</Button>
            <Button size="small" variant="text" onClick={() => setAllYoubiKoma(false)}>全て解除</Button>
            <table>
                <thead>
                    <tr>
                        <th></th> {/* 左上の空白セル */}
                        {youbis.map(youbi => (
                            <th key={youbi}>
                                <Button
                                    variant="text"
                                    onClick={() => setAllYoubi(youbi, !komas.every(koma => youbiKoma[`${youbi}${koma}`]))}
                                    sx={{
                                        padding: '4px 8px',
                                        minWidth: 'auto',
                                        lineHeight: 1.2,
                                        textTransform: 'none',
                                        height: '100%'
                                    }}
                                >{youbi}</Button>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {komas.map(koma => (
                        <tr key={koma}>
                            {/* コマのラベル */}
                            <td>
                                <Button
                                    variant="text"
                                    onClick={() => setAllKoma(koma, !youbis.every(youbi => youbiKoma[`${youbi}${koma}`]))}
                                    sx={{
                                        padding: '4px 8px',
                                        minWidth: 'auto',
                                        lineHeight: 1.2,
                                        textTransform: 'none',
                                        height: '100%'
                                    }}
                                >
                                    {/* Box で縦方向のフレックスコンテナを作成 */}
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}>
                                        {/* 1行目: ◯コマ */}
                                        <Typography component="span" sx={{ fontSize: '0.8rem' }}>
                                            {koma}コマ
                                        </Typography>
                                        {/* 2行目: 時間表示 */}
                                        <Typography component="span" variant="caption" sx={{
                                            fontSize: 'x-small',
                                            color: 'rgba(var(--main-color-rgb), 0.5)',
                                            lineHeight: 1
                                        }}>
                                            {komaTime[koma].start}-{komaTime[koma].end}
                                        </Typography>
                                    </Box>
                                </Button>
                            </td>

                            {/* 現在の行(コマ)における各曜日のチェックボックス */}
                            {youbis.map(youbi => (
                                // td 自体に onClick を追加し、Checkbox自体のクリックは無効化
                                <td
                                    key={youbi}
                                    onClick={() => handleYoubiKomaCheckboxChange(`${youbi}${koma}` as YoubiKoma, !youbiKoma[`${youbi}${koma}`])}
                                    style={{
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        verticalAlign: 'middle'
                                    }}
                                >
                                    <Checkbox
                                        size="small"
                                        checked={youbiKoma[`${youbi}${koma}`] ?? true}
                                        sx={{ pointerEvents: 'none' }}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <FormControlLabel
                control={
                    <Checkbox
                        size="small"
                        checked={youbiKoma["集中"] ?? true}
                        onChange={(e) => handleYoubiKomaCheckboxChange("集中", e.target.checked)}
                    />
                }
                label="集中"
            />
            {/* TODO: その他」に該当する授業は2023年4月のデータでは存在しないので、表示しないことにする。
            が、「その他」が存在しないことを保証しなければならない。
             */}
            {/* <label>
                その他
                <input
                    type="checkbox"
                    checked={youbiKoma["その他"] ?? true}
                    onChange={(e) => handleYoubiKomaCheckboxChange("その他", e.target.checked)}
                />
            </label> */}
        </div>
    );
};

export default KomaSelector;
