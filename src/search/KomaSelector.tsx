import React, { useState } from 'react';

export const youbis: Youbi[] = ["月", "火", "水", "木", "金"];
export const komas: Koma[] = [1, 2, 3, 4, 5];
export const specialSchedules: SpecialSchedule[] = ["集中", "その他"];

type Youbi = "月" | "火" | "水" | "木" | "金";
type Koma = 1 | 2 | 3 | 4 | 5;
type SpecialSchedule = "集中" | "その他";
export type YoubiKoma = `${Youbi}${Koma}` | SpecialSchedule;
export type YoubiKomaSelected = {
    [key in YoubiKoma]: boolean;
};

export const youbiKomaKeys: YoubiKoma[] = [
    ...youbis.flatMap(youbi => komas.map(koma => `${youbi}${koma}` as YoubiKoma)),
    "集中",
    "その他"
];

// export type YoubiKoma = { [key in `${Youbi}${Koma}` | "集中" | "その他"]?: boolean };
type KomaSelectorProps = {
    onScheduleChange: (schedule: YoubiKomaSelected) => void; // TODO: 命名
};

// const youbis: Youbi[] = ["月", "火", "水", "木", "金"];
// const komas: Koma[] = [1, 2, 3, 4, 5];

export const extractYoubiAndKoma = (youbiKoma: YoubiKoma) => {
    const result: { youbi: Youbi, koma: Koma }[] = [];

    Object.keys(youbiKoma).forEach(key => {
        if (key === "集中" || key === "その他") {
            // 特別なケースの処理
            console.log(`特別なスケジュール: ${key}`);
        } else {
            // 曜日とコマを分割
            const youbi = key.slice(0, -1) as Youbi;
            const koma = parseInt(key.slice(-1)) as Koma;
            result.push({ youbi: youbi, koma: koma });
        }
    });

    return result;
};

export const initializeYoubiKoma = (initialValue: boolean): YoubiKomaSelected => {
    const youbiKoma = {} as YoubiKomaSelected;

    youbis.forEach(youbi => {
        komas.forEach(koma => {
            youbiKoma[`${youbi}${koma}` as YoubiKoma] = initialValue;
        });
    });

    specialSchedules.forEach(special => {
        youbiKoma[special] = initialValue;
    });

    return youbiKoma;
};

const KomaSelector: React.FC<KomaSelectorProps> = ({ onScheduleChange }) => {
    // 初期状態で全ての曜日とコマをtrueに設定    // 曜日とコマの配列
    const youbis: Youbi[] = ["月", "火", "水", "木", "金"];
    const komas: Koma[] = [1, 2, 3, 4, 5];

    // 初期スケジュールを設定
    const initialSchedule: YoubiKomaSelected = initializeYoubiKoma(true);

    const [youbiKoma, setYoubiKoma] = useState<YoubiKomaSelected>(initialSchedule);
    youbis.forEach(youbi => {
        komas.forEach(koma => {
            initialSchedule[`${youbi}${koma}`] = true;
        });
    });
    initialSchedule["集中"] = true;
    initialSchedule["その他"] = true;


    const handleCheckboxChange = (key: YoubiKoma, checked: boolean) => {
        const newSchedule = { ...youbiKoma, [key]: checked };
        setYoubiKoma(newSchedule);
        onScheduleChange(newSchedule);
    };


    const toggleAll = (checked: boolean) => {
        const newSchedule = { ...youbiKoma };
        youbis.forEach(youbi => {
            komas.forEach(koma => {
                newSchedule[`${youbi}${koma}`] = checked;
            });
        });
        newSchedule["集中"] = checked;
        newSchedule["その他"] = checked;
        setYoubiKoma(newSchedule);
        onScheduleChange(newSchedule);
    };

    return (
        <>
            < table >
                <thead>
                    <tr>
                        <th></th> {/* 左上の空白セル */}
                        {youbis.map(youbi => (
                            <th key={youbi}>{youbi}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {komas.map(koma => (
                        <tr key={koma}>
                            <td>{koma}コマ</td> {/* コマのラベル */}
                            {youbis.map(youbi => (
                                <td key={youbi}>
                                    <input
                                        type="checkbox"
                                        checked={youbiKoma[`${youbi}${koma}`] ?? true}
                                        onChange={(e) => handleCheckboxChange(`${youbi}${koma}` as YoubiKoma, e.target.checked)}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table >
            <label>
                集中
                <input
                    type="checkbox"
                    checked={youbiKoma["集中"] ?? true}
                    onChange={(e) => handleCheckboxChange("集中", e.target.checked)}
                />
            </label>
            <label>
                その他
                <input
                    type="checkbox"
                    checked={youbiKoma["その他"] ?? true}
                    onChange={(e) => handleCheckboxChange("その他", e.target.checked)}
                />
            </label>

            <button onClick={() => toggleAll(true)}>全て選択</button>
            <button onClick={() => toggleAll(false)}>全て解除</button>
        </>
    );
};

export default KomaSelector;
