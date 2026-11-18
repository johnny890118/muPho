# MuPho

用歌名查找錄音版本，再透過歌名或人工整理的視覺線索探索攝影與插畫。可在同一頁預覽、收藏，也能帶著創作者署名分享。

## 本機啟動

需要 Node.js 22.13 以上及 npm。安裝後，首頁和本機收藏介面可直接開啟，外部搜尋預設關閉。

```sh
npm ci
npm run dev -- --hostname 127.0.0.1
```

瀏覽 [http://127.0.0.1:3000](http://127.0.0.1:3000)。要查詢真實來源，複製 `.env.example` 到 `.env.local`，設定以下值後重啟。

- `MUPHO_ENABLE_SEARCH=1`
- `MUPHO_SEARCH_DB` 為本機可寫磁碟上的絕對檔案路徑。先建立父目錄，例如專案內的 `.mupho/`。
- `MUPHO_PROVIDER_CONTACT` 為能識別營運者的 HTTPS 專案或聯絡頁。
- `MUPHO_SESSION_SECRET` 為隨機值，例如執行 `openssl rand -hex 32` 取得。多個程序需共用這個值。

操作路徑為「歌曲找圖 → 輸入歌名或歌名與歌手 → 選擇版本 → 點作品預覽」。也可直接切換「圖片搜尋」。預覽內可查看來源、取得原檔、複製署名、分享和收藏。「更像這張」從已取得的同類作品用標題及描述重新排序。

## 驗證

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run test:live` 選用。依序查詢 MusicBrainz 並依其退避規則停止，結果受上游資料與可用性影響。退避後可用 `npm run test:live -- --from 9 --count 4` 從指定的 1-based 案例繼續。

## UI 驗收

[Design System](docs/design/design-system.md) 是現行設計規範。依改動選擇檢查，視覺變更可先執行首頁基準測試。

```sh
npm run build
npm run test:visual
```

首頁快照使用 Playwright 鎖定的 Chromium、1440×900／390×844、測試專用字型與固定圖片。基準在 macOS 建立，其他平台跳過像素比較，可繼續跑一般互動測試。首次安裝瀏覽器使用 `npx playwright install chromium`。首頁基準範圍以外的頁面與狀態，依改動另開瀏覽器驗收。

比較失敗時先檢查 `test-results/` 的 expected、actual、diff。修正意外差異後重跑。只有確認是預期變更並檢視差異後，才用 `npx playwright test tests/home.visual.spec.ts --project=<受影響專案> --update-snapshots=changed` 更新該尺寸，再正常重跑。測試字型為首頁字元子集，若新增字元，檢查 fixture 的字形覆蓋與回退。和即時來源有關的冒煙測試另跑並另記結果。

## 圖片、跨引擎與本機模型驗收

- `npm run test:images:live --silent` 在有網路時依序查 Commons。可加 `-- --cases 5,10 --media illustration` 重跑指定案例。[24 首圖片驗收](docs/verification/image-relevance.md)
- `npx playwright install webkit` 後執行 `npm run test:webkit`，跑桌機與手機視窗的互動回歸。`npm test` 包含獨立程序共享 SQLite 額度測試。
- 若已啟動離線 llama.cpp 測試伺服器，可執行 `npm run test:lyrics:local`。評估只使用自撰樣本。[本機全詞模型驗收](docs/verification/local-lyrics-model.md)

## 營運

[架構](docs/architecture.md) · [可行性盤點](docs/feasibility.md) · [資料來源與授權](docs/providers-and-licensing.md) · [營運與額度](docs/operations-and-limits.md) · [首版驗收](docs/verification.md) · [主分支整合驗收](docs/verification/main-integration.md)

歌曲預設使用歌曲資料推薦。選曲後可在瀏覽器提供有權處理的歌詞，擷取固定詞庫中的視覺意象。未設定 GroqCloud 時，原文只在瀏覽器處理，外部歌詞來源維持停用。遇到授權或分類資料不足的作品會略過，部分查詢只會顯示少量作品。


## GroqCloud 完整歌詞找圖

搜尋啟用後，使用專用的 GroqCloud **Free** 組織，保持無付款方式並開啟 Zero Data Retention（ZDR）。在伺服器環境設定 `GROQ_API_KEY`、`MUPHO_GROQ_FREE_ZDR=1` 與 `MUPHO_GROQ_ORIGIN`（本機例為 `http://127.0.0.1:3174`，公開環境為精確 HTTPS origin）。金鑰勿放入公開變數、Git 或指令引數。啟用後先預選錄音；使用者可重新選擇，貼上全文並明確同意外送後才查詢。

額度由 SQLite 跨程序共享。上游組織的 Free 方案是零帳單的必要條件，MuPho 的呼叫上限另行防濫用。[操作與額度](docs/operations-and-limits.md) · [驗收方法](docs/verification/cloud-lyrics.md)
