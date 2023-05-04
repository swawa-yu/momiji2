import { schedule, kaisetsuki, Semester, jikiKubuns, JikiKubun, semesters } from ".";

/**
 * 
 * @param s 
 * @returns schedule[]
 */
export function parseKaisetsuki(s: string): kaisetsuki {
    // TODO 開口部局が大学院かどうかは履修年次に影響する
    // 1年次生 前期 集中
    // 空白によって3つに区切られている
    // TODO（それ以外のケースはないか）

    // n年次生 (n=1~5)
    // 前期 | 後期
    // １ターム | ２ターム | ３ターム | ４ターム | セメスター（前期） | セメスター（後期） | 集中 | 年度 | 通年
    // TODO それ以外のケースがないか

    const splitted = s.split(' ');

    // let semester: Semester
    // if (splitted[1] == "前期") {
    //     semester = "前期"
    // } else if (splitted[1] == "後期") {
    //     semester = "後期"
    // } else {
    //     semester = "解析エラー"
    // }

    // TODO ゴリ押し(下に同じ)
    return {
        rishuNenji: parseInt(splitted[0][0]),
        semester: semesters.some((v) => v === (splitted[1])) ? semesters.filter((v) => v === splitted[1])[0] : "解析エラー",
        // semester: semester,
        jikiKubun: jikiKubuns.some((v) => v === (splitted[2])) ? jikiKubuns.filter((v) => v === splitted[2])[0] : "解析エラー"
    };

}

export function parseSchedule(s: string) {
    // (1T) 木1-2：オンライン, (1T) 木3-4：霞R402講義室
    // 1年次生 前期 ２ターム,	(2T) 火7-8,金7-8：先405N

    // 空白で区切ったときの長さが2の時は、その後"："でsplitすれば曜日時限と教室に分かれる

    // 時間だけで部屋が書かれていないことがある
    // 時間がなく部屋だけ書かれているなど、その他のパターンはある？ →　ない

    let schedules: schedule[] = []
    try {

        const splitted = s.split(' ')
        // 1スケジュール単位を2つ以上繰り返すときに","がつくので、取り除く
        for (let i = 0; i < splitted.length / 2; i++) {
            const jigenAndRoom = splitted[i * 2].split("：");
            // TODO ゴリ押しすぎる
            const jiki: schedule['jikiKubun'] = jikiKubuns.some((v) => v === (splitted[i * 2])) ? jikiKubuns.filter((v) => v === splitted[i * 2])[0] : "解析エラー";
            const jigen: schedule['jigen'] = jigenAndRoom[0]
            const room: schedule['room'] = jigenAndRoom.length == 2 ? jigenAndRoom[1] : ""
            schedules.push({ jikiKubun: jiki, jigen: jigen, room: room })
        }
    } catch (e: unknown) {
        schedules.push({ jikiKubun: "解析エラー", jigen: "解析エラー", room: "解析エラー" })
        return schedules;
    }

    return schedules;
}




// 1年次生 前期 通年	(通) 金9-10：理B305
// 2年次生 前期 ターム外（前期）	(外前) 集中：詳細は掲示板参照
// 3年次生 前期 ２ターム	(2T) 水3-4,金5-6：文B104
// 2年次生 後期 ３ターム	(3T) 木3-4：文B253, (3T) 金5-6：文A152
// 2年次生 後期 セメスター（後期）	(後) 火5-10,水5-10
// 3年次生 前期 セメスター（前期）	(前) 月5-8,木5-8,金5-8：工B4-008