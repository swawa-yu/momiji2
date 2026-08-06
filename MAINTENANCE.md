# Maintenance roadmap

シラバスデータの取得・検証・配信に関する作業の入口です。
進捗と完了条件の正本は各 GitHub Issue とし、このファイルには優先順と責任範囲だけを記載します。

## 作業順

### P0: 現在のデータ不整合を直す

1. [#36 開講部局や科目区分のリストに変更があった場合に対応できるようにする](https://github.com/swawa-yu/momiji2/issues/36)
   - 最初の限定作業は、2026年度の「平和共修科目」5件を検索選択肢へ反映すること。
2. [#89 Harvesterとmomiji2のデータ契約を定義・検証する](https://github.com/swawa-yu/momiji2/issues/89)
   - JSONの形、必須項目、年度・取得日時・件数を機械検証できるようにする。
3. [#70 開講部局のハードコードをやめる](https://github.com/swawa-yu/momiji2/issues/70)
   - 学部・大学院の部局一覧を検証済み生成物から読み込む。

### P1: Harvesterを安全に一本化する

1. [MomijiHarvester #7 年度固定を解消し、Harvester実装とmomiji2向け出力を一本化する](https://github.com/swawa-yu/MomijiHarvester/issues/7)
   - 長期運用するHarvesterを決め、2025固定と出力形式の不一致を解消する。
2. [MomijiHarvester2026 #1 全件クロールの重複取得とサイト負荷を制御する](https://github.com/swawa-yu/MomijiHarvester2026/issues/1)
   - グローバル重複排除、dry-run、待機・リトライ・リクエスト上限を整える。

### P2: 更新フローを半自動化する

1. [#19 シラバスデータの更新を自動で行う](https://github.com/swawa-yu/momiji2/issues/19)
   - まず`pnpm import:harvester-generation --manifest <Harvester manifest> --departments <artifact> --check`で検証し、次に`pnpm import:harvester-generation --manifest <Harvester manifest> --departments <artifact>`で取り込んでから`pnpm generate:subject-constants`を実行する。安定後に年度更新期だけ定期実行する。
2. [#30 更新されたシラバスを確認できるようにしたい](https://github.com/swawa-yu/momiji2/issues/30)
   - 安定したデータ契約と更新フローの後に、追加・削除・変更差分を表示する。

### P3: データ配信を軽量化する

1. [#90 シラバス全件JSONをアプリ本体へバンドルしない配信方式を検討する](https://github.com/swawa-yu/momiji2/issues/90)
   - 約20MBの年度データをアプリ本体から分離し、初期読込とキャッシュ更新を改善する。

## 進め方

- 一度に1 Issueの最小範囲だけ変更し、検証後に次の作業案を確認する。
- スクレイピングの定期化前に、大学サイトの利用条件と許容負荷を確認する。
- データ検証に失敗した場合は、既存の公開データを維持する。
- 自動更新は直接mainへ反映せず、確認用PRを経由する。
- 既存の未コミット変更は、所有者と意図を確認するまで変更・削除・コミットしない。
