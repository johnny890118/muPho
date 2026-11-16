# MuPho 驗收紀錄

2026-11-17（台北時間）。以下在 Node.js 22.13.1 驗證。

| 驗證 | 結果 |
| --- | --- |
| `npm run lint`、`npm run typecheck`、`npm run build` | 通過。Next.js 16 App Router。Node.js 22.13.1 對 SQLite 發出 experimental 警告。 |
| `npm test` | 通過。涵蓋授權、媒體分類、URL 白名單、24 筆跨語言搜尋線索、同名版本、429／5xx／逾時，以及兩個 SQLite 連線共用原子額度和快取。 |
| `npm run test:e2e` | 通過 4 案。Chromium 桌面與 Pixel 7 尺寸，覆蓋同名候選、圖片翻頁去重、切換插畫、預覽鍵盤操作、分享的複製退路、收藏重整與取消、搜尋停用和額度警示。上游回應由測試安排，停用狀態使用真實本機 API。 |
| 真實 API／畫面 | MusicBrainz「Dreams」回傳 Fleetwood Mac 與 The Cranberries 的候選。Wikimedia「sunset」首批 18 張攝影。「night」在收緊插畫過濾後在首批只剩 1 張，題材仍可能偏離搜尋期待。Chromium 桌面和 Pixel 7 尺寸目視首頁、作品瀑布流與大圖對話框。縮圖載入，無水平溢位。 |
| `npm run test:live` | 未完成 24 首實網驗收。測到「晴天」及「稻香」時均在首位找到正確錄音，後續上游回傳暫時忙碌（HTTP 503），批次按規則停止。24 筆本地測試驗證的是查詢線索與模式，不代表上游召回率。 |
| `npm audit --omit=dev` | 正式依賴 0 個已知漏洞。完整 audit 尚有 8 個 lint 工具鏈的中度通報。 |

本地案例各有六筆中文、英文、日文和韓文歌曲，包含「Dreams」同名、「Clair de lune」「Summer」純音樂、全半形、羅馬拼音和混合語言歌名。純音樂及無歌詞情境以歌曲資料推薦，沒有外送內容。本版本沒有可執行的完整歌詞模式，因此該模式及全歌意境品質尚未驗收。

前端產物額外掃描 11 個 JavaScript 檔，未找到舊 `.env` 值或指定的憑證名稱。GitHub 最新 Production 部署作者為 `vercel[bot]`，現有整合設定未確認。為避免觸發預覽部署，分階段提交保留於本地開發分支。
