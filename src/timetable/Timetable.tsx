import { useState, useContext, useRef, useEffect } from 'react';
import { BookmarkContext, BookmarkContextType } from '../contexts/BookmarkContext';
import { youbis, komas } from '../search/KomaSelector';
import './Timetable.css';
import { subject2Map } from '../subject';

interface Position {
    top: number;
    left: number;
    width: number;
    height: number;
}

const Timetable = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };
    const tableRef = useRef<HTMLTableElement>(null);
    const timetableRef = useRef<HTMLDivElement>(null); // コンテナ用のref
    const [cellPositions, setCellPositions] = useState<{ [key: string]: Position }>({});


    // テーブルのセルの座標を計算(相対座標)......失敗
    useEffect(() => {
        console.log("useEffect")
        console.log(tableRef.current)
        // setTimeout(() => {
        if (tableRef.current && timetableRef.current) {
            const containerRect = timetableRef.current.getBoundingClientRect();
            const positions: { [key: string]: Position } = {};
            const rows = tableRef.current.rows;
            youbis.forEach((youbi, i) => {
                komas.forEach((koma, j) => {
                    const cell = rows[j + 1].cells[i + 1];
                    const cellRect = cell.getBoundingClientRect();
                    positions[`${youbi}${koma}`] = {
                        top: cellRect.top - containerRect.top,
                        left: cellRect.left - containerRect.left,
                        width: cell.clientWidth,
                        height: cell.clientHeight
                    };
                });
            });
            setCellPositions(positions);
        }
        // }, 0)
    }, []);

    // タームの状態管理
    const [term, setTerm] = useState(1);

    // ターム切り替え関数
    const switchTerm = (newTerm: number) => {
        setTerm(newTerm);
    };

    const { bookmarkedSubjects } = useContext<BookmarkContextType>(BookmarkContext);

    // 表のレンダリング
    return (
        <div className={`timetable-window ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <button className="toggle-button" onClick={toggleExpansion}>
                {isExpanded ? '▼' : '▲'}
            </button>
            {isExpanded && (
                <div className='content'>
                    <div className="term-buttons">
                        {[1, 2, 3, 4].map(t => (
                            <button key={t} onClick={() => {
                                switchTerm(t);
                                console.log(bookmarkedSubjects);

                                Array.from(bookmarkedSubjects).map(subjectCode => {
                                    const schedules = subject2Map[subjectCode]["授業時間・講義室"];
                                    schedules.map(schedule => {
                                        if (schedule.jigen === undefined) return null; // 集中
                                        if (schedule.jigen?.komaRange === "解析エラー") return null; // その他
                                        // TODO: if(schedule.term !== term) return null;
                                        const position = cellPositions[`${schedule.jigen?.youbi}${schedule.jigen?.komaRange[0]}`];
                                        if (position) {
                                            console.log(position.top),
                                                console.log(position.left),
                                                console.log(position.width),
                                                console.log(position.height * (schedule.jigen?.komaRange[1] - schedule.jigen?.komaRange[0] + 1));
                                            // その他のスタイリング
                                        }
                                    }
                                    );
                                });
                            }}>{t}ターム</button>
                        ))}
                    </div>
                    <div className="timetable" ref={timetableRef}>
                        <div className='table-body'>
                            <table ref={tableRef}>
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
                                            <td>{koma}</td> {/* コマのラベル */}
                                            {youbis.map(youbi => (
                                                <td key={youbi}>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="class-objects">
                            {Array.from(bookmarkedSubjects).map(subjectCode => {
                                const schedules = subject2Map[subjectCode]["授業時間・講義室"];
                                return schedules.map(schedule => {
                                    if (schedule.jigen === undefined) return null; // 集中
                                    if (schedule.jigen?.komaRange === "解析エラー") return null; // その他
                                    // TODO: if(schedule.term !== term) return null;
                                    const position = cellPositions[`${schedule.jigen?.youbi}${schedule.jigen?.komaRange[0]}`];
                                    if (position) {
                                        return (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: position.top + 'px',
                                                    left: position.left + 'px',
                                                    width: position.width + 'px',
                                                    height: position.height * (schedule.jigen?.komaRange[1] - schedule.jigen?.komaRange[0] + 1) + 'px',
                                                    backgroundColor: 'green',
                                                    // その他のスタイリング
                                                }}
                                            >
                                                {subject2Map[subjectCode]["授業科目名"]}
                                            </div>
                                        );
                                    }
                                    return null;
                                });
                            })}
                        </div>
                        <div className="concentrated-classes">
                            {/* 集中講義の描画 */}
                        </div>
                    </div >
                </div>
            )}
        </div>)
}

export default Timetable;
