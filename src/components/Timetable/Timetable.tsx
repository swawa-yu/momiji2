import { useState, useContext, useRef, useEffect } from 'react';
import { BookmarkContext, BookmarkContextType } from '../../contexts/BookmarkContext';
import './Timetable.css';
import { subject2Map } from '../../subject';
import { youbis, komas, JikiKubun } from '../../types/subject';

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
        if (tableRef.current && timetableRef.current) {
            const containerRect = timetableRef.current.getBoundingClientRect();
            const positions: { [key: string]: Position } = {};
            const rows = tableRef.current.rows;
            youbis.forEach((youbi, i) => {
                komas.forEach((koma, j) => {
                    const cell = rows[j + 1].cells[i + 1];  // 1行目と1列目は見出し
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
    }, []);

    // タームの状態管理
    // TODO: 型
    const [term, setTerm] = useState<JikiKubun>("１ターム");

    // ターム切り替え関数
    const switchTerm = (newTerm: JikiKubun) => {
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
                        {(["１ターム", "２ターム", "３ターム", "４ターム"] as JikiKubun[]).map(t => (
                            (term === t) ?
                                <button key={t} onClick={() => { switchTerm(t); }} className='term-selected'>{t}</button> :
                                <button key={t} onClick={() => { switchTerm(t); }}>{t}</button>
                        ))}
                    </div>
                    <div className="timetable" ref={timetableRef}>
                        <div className='table-body'>
                            <table ref={tableRef}>
                                <thead>
                                    <tr>
                                        {/* 左上の空白セル */}
                                        <th></th>
                                        {youbis.map(youbi => (
                                            <th key={youbi}>{youbi}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {komas.map(koma => (
                                        <tr key={koma}>
                                            {/* コマのラベル */}
                                            <td>{koma}</td>

                                            {/* コマのセル(空) */}
                                            {youbis.map(youbi => (
                                                <td key={youbi}></td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* TODO: 表示しているタームによって、授業は描画したりしなかったりするようにしなければならない */}
                        {/* TODO: タームにマッチするのを描画するんじゃなくて、各タームのテーブルを用意した上で表示するものを選択するべきかもしれない */}
                        <div className="class-objects">
                            {Array.from(bookmarkedSubjects).map(subjectCode => {
                                const schedules = subject2Map[subjectCode]["授業時間・講義室"];
                                if (schedules === undefined) return null; // 授業時間・講義室が解析エラーの場合はnullを返す
                                return schedules.map(schedule => {
                                    if (schedule.jigen === undefined) return null; // 集中
                                    if (schedule.jigen.komaRange === undefined) return null; // 解析エラーやコマが指定されていない可能性を考慮
                                    // TODO: if(schedule.term !== term) return null;
                                    const position = cellPositions[`${schedule.jigen.youbi}${schedule.jigen.komaRange.begin}`];

                                    // 1~4タームの場合
                                    if (position && schedule.jikiKubun === term) {
                                        return (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: position.top + 'px',
                                                    left: position.left + 'px',
                                                    width: position.width + 'px',
                                                    height: position.height * (schedule.jigen.komaRange.last - schedule.jigen.komaRange.begin + 1) + 'px',
                                                    backgroundColor: 'rgba(20, 200, 20, 0.5)', // TODO: 適当な色の設定
                                                }}
                                            >
                                                {subject2Map[subjectCode]["授業科目名"]}
                                            </div>
                                        );
                                    }

                                    // セメスター科目の場合
                                    if (position && (
                                        schedule.jikiKubun === "セメスター（前期）" && (term === "１ターム" || "２ターム") ||
                                        schedule.jikiKubun === "セメスター（後期）" && (term === "３ターム" || "４ターム")
                                    )) {
                                        return (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: position.top + 'px',
                                                    left: position.left + 'px',
                                                    width: position.width + 'px',
                                                    height: position.height * (schedule.jigen.komaRange.last - schedule.jigen.komaRange.begin + 1) + 'px',
                                                    backgroundColor: 'rgba(20, 200, 20, 0.5)', // TODO: 適当な色の設定
                                                }}
                                            >
                                                {subject2Map[subjectCode]["授業科目名"]}
                                            </div>
                                        );
                                    }

                                    // その他の場合
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
