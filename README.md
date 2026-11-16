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

## 營運

[架構](docs/architecture.md) · [可行性盤點](docs/feasibility.md) · [資料來源與授權](docs/providers-and-licensing.md) · [營運與額度](docs/operations-and-limits.md) · [驗收紀錄](docs/verification.md)

此版本使用歌曲資料推薦，歌詞上傳、完整歌詞分析和外部 AI 均關閉。遇到授權或分類資料不足的作品會略過，部分查詢只會顯示少量作品。
