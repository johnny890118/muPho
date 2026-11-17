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

`npm run test:live` 選用。依序查詢 MusicBrainz 並依其退避規則停止，結果受上游資料與可用性影響。

## UI 驗收

[Design System](docs/design/design-system.md) 是現行設計規範。依改動選擇檢查，視覺變更可先執行首頁基準測試。

```sh
npm run build
npm run test:visual
```

首頁快照使用 Playwright 鎖定的 Chromium、1440×900／390×844、測試專用字型與固定圖片。基準在 macOS 建立，其他平台跳過像素比較，可繼續跑一般互動測試。首次安裝瀏覽器使用 `npx playwright install chromium`。首頁基準範圍以外的頁面與狀態，依改動另開瀏覽器驗收。

比較失敗時先檢查 `test-results/` 的 expected、actual、diff。修正意外差異後重跑。只有確認是預期變更並檢視差異後，才用 `npx playwright test tests/home.visual.spec.ts --project=<受影響專案> --update-snapshots=changed` 更新該尺寸，再正常重跑。測試字型為首頁字元子集，若新增字元，檢查 fixture 的字形覆蓋與回退。和即時來源有關的冒煙測試另跑並另記結果。

## 營運

[架構](docs/architecture.md) · [可行性盤點](docs/feasibility.md) · [資料來源與授權](docs/providers-and-licensing.md) · [營運與額度](docs/operations-and-limits.md) · [驗收紀錄](docs/verification.md)

歌曲預設使用歌曲資料推薦。選曲後可在瀏覽器提供有權處理的歌詞，擷取固定詞庫中的視覺意象。原文不傳送、不保存。外部歌詞來源與 AI 語意分析維持停用。遇到授權或分類資料不足的作品會略過，部分查詢只會顯示少量作品。
