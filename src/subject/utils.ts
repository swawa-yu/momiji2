import {
    Schedule, Kaisetsuki,
    jikiKubuns,
    semesters,
    Jigen,
    JikiKubun
} from "../types/subject";

// TODO: semester, jikikubunはKaisetsukiとScheduleで被っている

/**
 * 
 * @param s: string
 * @returns Kaisetsuki
 */
export function parseKaisetsuki(s: string): Kaisetsuki {
    // TODO 開口部局が大学院かどうかが履修年次に影響する
    // 1年次生 前期 ２ターム
    // 1年次生 前期 集中
    // 1年次生 後期 セメスター（後期）
    // 空白によって3つに区切られている
    // TODO（それ以外のケースはないか）

    // n (n=1~5) ※修士博士をどう扱うか(そのための実装はまだできていないので、修士1年は5年じゃなくて1年になる)
    // 前期 | 後期
    // １ターム | ２ターム | ３ターム | ４ターム | セメスター（前期） | セメスター（後期） | 集中 | 年度 | 通年

    const splitted = s.split(' ');

    return {
        rishuNenji: parseInt(splitted[0][0]),
        semester: semesters.some((v) => v === (splitted[1])) ? splitted[1] as Kaisetsuki['semester'] : undefined,
        jikiKubun: jikiKubuns.some((v) => v === (splitted[2])) ? splitted[2] as Kaisetsuki['jikiKubun'] : undefined
    };

}

const jikiKubunMap: { [key: string]: JikiKubun } = {
    "(1T)": "１ターム",
    "(2T)": "２ターム",
    "(3T)": "３ターム",
    "(4T)": "４ターム",
    "(前)": "セメスター（前期）",
    "(後)": "セメスター（後期）",
    "(外前)": "ターム外（前期）",
    "(外後)": "ターム外（後期）",
    "(集)": "集中",
    "(年)": "年度",
    "(通)": "通年",
}

/**
 * 
 * @param s: string
 * @returns Schedule[]
 */
export function parseSchedule(s: string) {
    // TODO: 補足できていないパターンがあってもエラーとして扱えないかもしれない！！

    // 例----------------------------------------
    // (2T) 火7-8, 金7-8：先405N
    // (1T) 木1-2：オンライン, (1T) 木3-4：霞R402講義室
    // (4T) 集中：担当教員の指定による
    // (前) 木7-8：理E102
    // (前) 金7-8：北体育館,教K102
    // (後) 集中                                                (HX203900, 数学特別講義（数論力学系入門）)
    // (2T) 水5-6：理E104,理E209, (2T) 木1-2：理E209,理E210       (HA500000)
    // (2T) 火1：保301,保302, (2T) 火2：保301                     (I3151001)
    // ------------------------------------------

    // 検索するとき、部屋は別にそんなに重要ではない
    // ただし、空き部屋検索のときは重要

    // 空白で区切ったときの長さが2の時は、その後"："でsplitすれば曜日時限と教室に分かれる

    // 時間だけで部屋が書かれていないことがある
    // 時間がなく部屋だけ書かれているなど、その他のパターンはある？ →　ない(検証済み)

    let schedules: Schedule[] = []

    try {
        // (2T) 水5-6：理E104,理E209, (2T) 木1-2：理E209,理E210     (HA500000) みたいなパターンを、split(", ")で処理できると信じる
        s.split(", ").forEach((s) => {
            // splittedBySpace = ["(前)", "木7-8：理E102"]
            // splittedByColon = ["木7-8", "理E102"]
            // jikiKubun = "セメスター（前期）"
            // jigenString = "木7-8"
            // jigenNums = [7, 8]
            // rooms = ["理E102"]

            const splittedBySpace = s.split(' ');
            const splittedByColon = splittedBySpace[1].split('：');

            // 時期区分の部分が変換用辞書の中にない場合は解析エラー // TODO: 専用のエラーを投げることができたらうれしい
            const jikiKubun: Schedule['jikiKubun'] = jikiKubunMap[splittedBySpace[0]] ? jikiKubunMap[splittedBySpace[0]] : undefined;

            const rooms = splittedByColon[1] ? splittedByColon[1].split(',') : [];

            const jigenString = splittedByColon[0];
            // jigenStringの0文字目は曜日
            // jigenStringの1文字目以降をsplit('-')してさらに各要素をintに変換したもの
            // jigenString = "集中" の場合は特別に処理(jigen: undefined とする)
            if (jigenString === "集中") {
                schedules.push({ jikiKubun: jikiKubun, jigen: undefined, rooms: rooms })
            } else {
                // jigenString = "火9-10,金1-2" みたいなパターンもここで処理できる
                jigenString.split(',').forEach((jigenString) => {
                    const jigenNums = jigenString.slice(1).split('-').map((v) => parseInt(v));

                    const jigen: Schedule["jigen"] = {
                        youbi: jigenString[0] as Jigen['youbi'],
                        jigenRange: {
                            begin: jigenNums[0],
                            last: jigenNums[jigenNums.length - 1]
                        },
                        komaRange: {
                            begin: (jigenNums[0] + 1) / 2 | 0,
                            last: (jigenNums[jigenNums.length - 1] + 1) / 2 | 0
                        }
                    }

                    schedules.push({ jikiKubun: jikiKubun, jigen: jigen, rooms: rooms })
                })
            }
        })
        return schedules;
    } catch (e: unknown) {
        schedules.push({ jikiKubun: undefined, jigen: { youbi: undefined, jigenRange: undefined, komaRange: undefined }, rooms: ["解析エラー"] }) // TODO: roomsの扱い
        return schedules;
    }
}




// 1年次生 前期 通年	(通) 金9-10：理B305
// 2年次生 前期 ターム外（前期）	(外前) 集中：詳細は掲示板参照
// 3年次生 前期 ２ターム	(2T) 水3-4,金5-6：文B104
// 2年次生 後期 ３ターム	(3T) 木3-4：文B253, (3T) 金5-6：文A152
// 2年次生 後期 セメスター（後期）	(後) 火5-10,水5-10
// 3年次生 前期 セメスター（前期）	(前) 月5-8,木5-8,金5-8：工B4-008


export function convertURLtoAbsolute(relativeURL: string) {
    return 'https://momiji.hiroshima-u.ac.jp/syllabusHtml/' + relativeURL
}