import {
    Schedule, Kaisetsuki,
    // Semester,
    jikiKubuns,
    // JikiKubun,
    semesters,
    Jigen,
    JikiKubun
} from ".";

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
        semester: semesters.some((v) => v === (splitted[1])) ? splitted[1] as Kaisetsuki['semester'] : "解析エラー",
        jikiKubun: jikiKubuns.some((v) => v === (splitted[2])) ? splitted[2] as Kaisetsuki['jikiKubun'] : "解析エラー"
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
    // 例----------------------------------------
    // (2T) 火7-8, 金7-8：先405N        → (2T) 火7-8：先405N, (2T) 金7-8：先405N
    // (1T) 木1-2：オンライン, (1T) 木3-4：霞R402講義室
    // (4T) 集中：担当教員の指定による
    // (前) 木7-8：理E102
    // (前) 金7-8：北体育館,教K102      → そのままでOK
    // ------------------------------------------

    // 検索するとき、部屋は別にそんなに重要ではない
    // ただし、空き部屋検索のときは重要

    // 空白で区切ったときの長さが2の時は、その後"："でsplitすれば曜日時限と教室に分かれる

    // 時間だけで部屋が書かれていないことがある
    // 時間がなく部屋だけ書かれているなど、その他のパターンはある？ →　ない(検証済み)

    let schedules: Schedule[] = []



    // シンプルなパターンの実装
    try {
        const splittedBySpace = s.split(' ');
        const splittedByColon = splittedBySpace[1].split('：');

        // 辞書の中にない場合は解析エラー
        const jikiKubun: Schedule['jikiKubun'] = jikiKubunMap[splittedBySpace[0]] ? jikiKubunMap[splittedBySpace[0]] : "解析エラー";

        jikiKubunMap[splittedBySpace[0]];

        const jigenString = splittedByColon[0]; // 金3-6 (難しいやつだと火7-8,金7-8もある)
        // jigenStringの0文字目は曜日
        // jigenStringの1文字目以降をsplit('-')してさらに各要素をintに変換したもの
        const jigenNums = jigenString.slice(1).split('-').map((v) => parseInt(v));

        const jigen: Schedule["jigen"] = jigenString[0] === "集" ? undefined : {
            youbi: jigenString[0] as Jigen['youbi'],
            jigenRange: [jigenNums[0], jigenNums[jigenNums.length - 1]] as Jigen['jigenRange'],
            komaRange: [(jigenNums[0] + 1) / 2 | 0, (jigenNums[jigenNums.length - 1] + 1) / 2 | 0] as Jigen['komaRange']
        }

        const room = splittedByColon[1];

        schedules.push({ jikiKubun: jikiKubun, jigen: jigen, room: room })
    } catch (e: unknown) {
        schedules.push({ jikiKubun: "解析エラー", jigen: { youbi: "解析エラー", jigenRange: "解析エラー", komaRange: "解析エラー" }, room: "解析エラー" })
        return schedules;
    }


    // 複雑なパターンの実装
    // try {
    //     const hiphenCount = s.split('-').length - 1;
    //     const colonCount = s.split('：').length - 1;
    //     const splitted = s.split(' ')
    //     // 1スケジュール単位を2つ以上繰り返すときに","がつくので、取り除く
    //     for (let i = 0; i < splitted.length / 2; i++) {
    //         const jigenAndRoom = splitted[i * 2].split("：");

    //         // TODO ゴリ押しすぎる
    //         const jiki: Schedule['jikiKubun'] = jikiKubuns.some((v) => v === (splitted[i * 2])) ?
    //             jikiKubuns.filter((v) => v === splitted[i * 2])[0] :
    //             "解析エラー";
    //         const jigen: Schedule["jigen"] = { youbi: "解析エラー", jigenRange: "解析エラー", komaRange: "解析エラー" }
    //         const room: Schedule['room'] = jigenAndRoom.length == 2 ?
    //             jigenAndRoom[1] :
    //             ""
    //         schedules.push({ jikiKubun: jiki, jigen: jigen, room: room })
    //     }
    // } catch (e: unknown) {
    //     schedules.push({ jikiKubun: "解析エラー", jigen: { youbi: "解析エラー", jigenRange: "解析エラー", komaRange: "解析エラー" }, room: "解析エラー" })
    //     return schedules;
    // }

    return schedules;
}




// 1年次生 前期 通年	(通) 金9-10：理B305
// 2年次生 前期 ターム外（前期）	(外前) 集中：詳細は掲示板参照
// 3年次生 前期 ２ターム	(2T) 水3-4,金5-6：文B104
// 2年次生 後期 ３ターム	(3T) 木3-4：文B253, (3T) 金5-6：文A152
// 2年次生 後期 セメスター（後期）	(後) 火5-10,水5-10
// 3年次生 前期 セメスター（前期）	(前) 月5-8,木5-8,金5-8：工B4-008