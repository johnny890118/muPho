# MuPho 電影感介面及搜尋驗收

2026-11-17（台北時間）。開發分支 `codex/mupho-rebuild`。

## 搜尋修復

舊版 `晴天 — 周杰倫` 已能取得 MusicBrainz 曲目。問題出在選曲後的 `sunlight school bicycle`，Commons 索引只找到 1 筆候選，符合 MuPho 授權及媒材條件的作品為 0。兩種較短的輸入格式則在舊版歌曲查詢各得到 HTTP 200、0 筆。完整基線見 [盤點](../design/ui-rebuild-plan.md)。

短橫線、空格、簡繁字和常見藝人別名，現在會把已知歌名及藝人組合轉成相同的曲目與快取查詢。對未辨識的歌曲，保留輸入中的連字號與空格。選曲後採用 `school corridor`，首批為空才嘗試一次 `schoolyard`。分頁沿用成功的查詢。每次來源請求仍經既有 SQLite 訪客、網路及全域額度，快取命中可重用結果，503 與上游 429 的冷卻會跨本機程序保留原本的錯誤類別。

實網短測涵蓋下列結果。瀏覽器跨視窗重用同一組真實回應，測試未逐視窗重打上游。

| 查詢或流程 | HTTP 結果 |
| --- | --- |
| `晴天 — 周杰倫`、`晴天-周杰倫`、`晴天 周杰倫` | 200，各有 10 個候選。首筆為周杰倫 `729c6839-a400-41aa-aeb1-dfe657dc8be2` |
| `晴天` | 200，18 個候選，周杰倫在首位 |
| `晴天` 選曲 → `school corridor` → 攝影 | 200，18 張符合 MuPho 篩選，成功開啟預覽、收藏及帶歌曲署名的分享文案 |
| 直接圖片搜尋 `sunset` | 200，18 張 |
| `Dreams` | 200，18 個版本，含 Fleetwood Mac 與 The Cranberries |
| `Space Oddity — David Bowie` | 503，顯示上游暫時無法回應。依冷卻規則結束該次批次 |
| `夜に駆ける — YOASOBI`、`봄날 — BTS` | 該批實網測試跳過，本地正規化回歸通過 |

實網擷取曾遇到一次 MusicBrainz 503，冷卻後再次執行取得真實結果。一次退讓、429、503 和候選全數被政策篩掉的行為另以受控 fixture 驗證。預覽中的 Commons 原始檔案頁回應 HTTP 200，頁面列有 Anni Koponen 與 CC BY 4.0。[預覽作品與授權](https://commons.wikimedia.org/wiki/File:Corridor_in_Koivukyl%C3%A4_School_in_Rekola,_Vantaa,_Finland,_2022.jpg)

## 測試

| 指令 | 結果 |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS，9 項單元／整合 |
| `npm run build` | PASS，Node.js 22.13.1 的 SQLite experimental 警告仍存在 |
| `npm run test:e2e` | PASS，20 項 Chromium 檢查，含下表四種視窗與 844×390 手機橫向 |
| 真實瀏覽器驗收 | PASS，四種指定視窗均開啟真實歌曲、圖庫、圖片、收藏與分享文案，無水平溢位或未捕捉的頁面錯誤 |

自動驗收包含同名選曲、一次搜尋退讓、兩種搜尋模式互切、首屏網格、長標題、逐批載入去重、預覽高解析圖失敗回縮圖、左右鍵／觸控、Esc 和焦點回到圖庫、收藏重開、分享文案以及各種空結果和額度。使用器件模擬及實際 Chromium，實體手機與系統分享面板未測。暖白／主背景、次文字／卡片、主按鈕文字／琥珀底的實色 token 對比分別為 16.11、8.13、10.14。

## 瀏覽器截圖

| 視窗 | 首頁 | 真實搜尋結果 | 真實預覽 | 首張圖頂端 |
| --- | --- | --- | --- | --- |
| 1440×900 | [首頁](screenshots/home-1440.jpg) | [結果](screenshots/results-1440.jpg) | [預覽](screenshots/preview-1440.jpg) | 151 px |
| 768×1024 | [首頁](screenshots/home-768.jpg) | [結果](screenshots/results-768.jpg) | [預覽](screenshots/preview-768.jpg) | 151 px |
| 390×844 | [首頁](screenshots/home-390.jpg) | [結果](screenshots/results-390.jpg) | [預覽](screenshots/preview-390.jpg) | 267 px |
| 375×812 | [首頁](screenshots/home-375.jpg) | [結果](screenshots/results-375.jpg) | [預覽](screenshots/preview-375.jpg) | 267 px |

[選曲](screenshots/recordings-390.jpg) · [收藏](screenshots/favorites-390.jpg) · [來源 503 fixture](screenshots/offline-fixture-390.jpg) · [額度 fixture](screenshots/quota-fixture-390.jpg) · [授權及媒材過濾後為空 fixture](screenshots/filtered-fixture-390.jpg)

和方向圖相比，首頁使用 Commons 的實景雨街及三張署名選圖。搜尋結果取決於歌曲資料及免費索引，`晴天` 此次以校園紀實照為主。預覽保留圖片比例，桌機將作品資訊移到側欄，手機預覽高度跟隨圖片比例。實作顯示作者、來源與授權擷取日，省略方向圖中模擬的法務背書。

## 已知限制與成本

完整歌詞授權、上傳、理解與外部 AI 目前未啟用。保留 `VisualIntent` 接點，現用 `metadata_only`。Commons 插畫供應及類型判斷有限，作品題材、實網可用性與免費額度會變化。本次新增成本 NT$0，新增的封面從原來源下載既有縮圖，使用既有免費 API、SQLite 與本機瀏覽器測試。本次 Git 僅建立本地提交。啟動設定見 [README](../../README.md)。
