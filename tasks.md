# シラバス検索システム レビューメモ (2025-04-12 更新)

## 決定事項・進行中のタスク

- **UI ライブラリ導入決定**: **MUI (Material UI)** を使用する。
- **Git ブランチ戦略**: `develop` -> `refactor/ui-library-integration` (改善用ベース) -> `feature/xxx` (タスクごと) の流れで進める。マージは Pull Request 経由を推奨。
- **使用ツール**: ビルドツールは `Vite`、パッケージマネージャーは `pnpm` を使用。
- **進行中**: デザイン改善 - ステップ1: UI ライブラリ導入 (Now)

## デザイン改善 - ステップ1: UI ライブラリ選定・導入

- [x] **UI ライブラリ選定**: MUI (Material UI) に決定。
- [ ] **UI ライブラリ導入**: MUI をプロジェクトにインストールし、基本的な設定を行う。(対応中)
    - [x] MUI パッケージのインストール (`@mui/material`, `@emotion/react`, `@emotion/styled`)
    - [x] Roboto フォントの追加 (`index.html`)
    - [x] Material Icons (SVG) パッケージのインストール (`@mui/icons-material`)
    - [ ] `index.html` の修正 (Material Icons フォント版 `<link>` 削除) (対応中)
    - [ ] `ThemeProvider` と `CssBaseline` の設定 (`src/main.tsx`) (対応中)

## CSS に関する点 (UI ライブラリ導入後に再評価)

- [ ] **`!important` の削減**: (保留)
- [ ] **CSS 変数の活用促進**: (保留)
- [ ] **セレクタとクラス名**: (UI ライブラリ/CSS 設計手法導入で対応)
- [ ] **レイアウト (Flexbox/Grid)**: (保留)
- [ ] **絶対配置の見直し**: (保留)

## TypeScript とロジックに関する点

- [ ] **型定義 (`src/types/`)**: (未着手)
- [ ] **データパース (`src/subject/utils.ts`)**: (未着手)
- [ ] **検索ロジック (`src/search/index.ts`)**: (未着手)
- [ ] **初期化処理 (`src/subject/index.ts`)**: (未着手)

## UI/UX とデザインに関する提案 (UI ライブラリ導入後に具体化)

- [ ] **検索インターフェース改善**: (保留)
- [ ] **テーブル表示 (`TableView`) 改善**: (保留)
- [ ] **時間割表示 (`Timetable`) 改善**: (保留)

## 次のステップ

- [ ] **ユーザー**: `index.html` から Material Icons フォント版の `<link>` タグを削除する。
- [ ] **ユーザー**: `src/main.tsx` に `ThemeProvider` と `CssBaseline` を設定する。
- [ ] **ユーザー**: 作業完了後、`feature/install-mui` を `refactor/ui-library-integration` にマージする (Pull Request 推奨)。
- [ ] **ユーザー**: (必要に応じて) 主要な React コンポーネント (`.tsx`) のコードを共有する。