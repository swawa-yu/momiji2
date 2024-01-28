import React, { useState } from 'react';
import './KomaSelector.css';
import { Youbi, Koma, YoubiKoma, YoubiKomaSelected, initializeYoubiKoma, youbis, komas, komaTime } from '.';


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
            <button onClick={() => setAllYoubiKoma(true)}>全て選択</button>
            <button onClick={() => setAllYoubiKoma(false)}>全て解除</button>
            <table>
                <thead>
                    <tr>
                        <th></th> {/* 左上の空白セル */}
                        {youbis.map(youbi => (
                            <th key={youbi}><button onClick={() => setAllYoubi(youbi, !komas.every(koma => youbiKoma[`${youbi}${koma}`]))}>{youbi}</button></th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {komas.map(koma => (
                        <tr key={koma}>
                            {/* コマのラベル */}
                            <td>
                                <button onClick={() => setAllKoma(koma, !youbis.every(youbi => youbiKoma[`${youbi}${koma}`]))}>
                                    {koma}コマ
                                    <br />
                                    <div className="komatime">{komaTime[koma].start}-{komaTime[koma].end}</div>
                                </button>

                            </td>

                            {/* 現在の行(コマ)における各曜日のチェックボックス */}
                            {youbis.map(youbi => (
                                <td key={youbi}>
                                    <input
                                        type="checkbox"
                                        checked={youbiKoma[`${youbi}${koma}`] ?? true}
                                        onChange={(e) => handleYoubiKomaCheckboxChange(`${youbi}${koma}` as YoubiKoma, e.target.checked)}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <label>
                集中
                <input
                    type="checkbox"
                    checked={youbiKoma["集中"] ?? true}
                    onChange={(e) => handleYoubiKomaCheckboxChange("集中", e.target.checked)}
                />
            </label>
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
