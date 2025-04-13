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
    onSelectionChange: (youbiKomaSelected: YoubiKomaSelected) => void; // TODO: 命名　scheduleというのは他の使い方もしているので紛らわしい
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
                        {/* 左上の空白セル */}
                        <th></th>
                        {youbis.map(youbi => (
                            <th key={youbi}>
                                <Button variant="text" onClick={() => setAllYoubi(youbi, !komas.every(koma => youbiKoma[`${youbi}${koma}`]))}>
                                    {youbi}
                                </Button>
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
                                    variant="text" // text ボタンが良いでしょう
                                    // onClick の条件式は修正済みのものを使用してください
                                    onClick={() => setAllKoma(koma, !youbis.every(youbi => youbiKoma[`${youbi}${koma}`]))}
                                    // onClick={() => setAllKoma(koma, !youbis.some(youbi => youbiKoma[`${youbi}${koma}`]))}
                                    sx={{
                                        // ボタン自体のスタイル調整 (必要に応じて値を調整)
                                        padding: '4px 8px', // 少し小さめのパディング
                                        minWidth: 'auto',   // コンテンツに応じた幅に
                                        lineHeight: 1.2,    // 行間を詰める
                                        textTransform: 'none', // テキストが大文字になるのを防ぐ
                                        height: '100%'      // セルの高さに合わせる (任意)
                                    }}
                                >
                                    {/* Box で縦方向のフレックスコンテナを作成 */}
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column', // 子要素を縦に並べる
                                        alignItems: 'center'    // 中央揃え
                                    }}>
                                        {/* 1行目: ◯コマ */}
                                        <Typography component="span" sx={{ fontSize: '0.8rem' /* 例: 少し小さめ */ }}>
                                            {koma}コマ
                                        </Typography>
                                        {/* 2行目: 時間表示 */}
                                        {/* sx で .komatime のスタイルを再現 */}
                                        <Typography component="span" variant="caption" sx={{
                                            fontSize: 'x-small',
                                            color: 'rgba(var(--main-color-rgb), 0.5)', // index.css の変数を参照 (要確認)
                                            // または直接指定 color: 'text.secondary' などテーマの色を使うのも良い
                                            lineHeight: 1 // 行間調整
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
