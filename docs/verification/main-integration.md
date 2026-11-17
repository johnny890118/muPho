# MuPho 主分支整合與剩餘功能驗收

2026-11-17（台北時間）。原 `main` 與遠端均位於 `6b050b2`。整合前工作樹乾淨，開發分支 `c269e3d` 已包含原主分支，因此以 `git merge --ff-only` 整合並保留全部提交。其後直接在 `main` 開發並以 fast-forward 同步 GitHub。

GitHub 無啟用中的 repository webhook、Actions workflow 為 0。上次 Vercel Production 部署對應 `6b050b2`。本次在版本庫設定停用 `main` 自動部署，新增成本 NT$0。[Vercel Git 設定](https://vercel.com/docs/project-configuration/git-configuration)

## 補齊功能

- 選曲後可提供有權處理的歌詞。點選同意後，瀏覽器逐行以固定詞庫辨識意象。搜尋只送出如 `window rain` 的固定詞，原文不寫入瀏覽器儲存或送至 API。套用會清除輸入，沒有可辨識意象時可繼續用歌曲資料或微調，並可隨時返回歌曲資料模式。
- 實網補驗找出兩個可以修正的跨語言辨識缺口。`Through the Night — IU` 一度只找到字幕影片，限定 IU 後改查 `밤편지`。`벚꽃 엔딩 — Busker Busker` 在英文藝人名零候選，改用 MusicBrainz 的原文藝人名 `버스커 버스커`。兩筆修正均在實網取得原曲。
- Commons 首次檢索仍是 CC BY 4.0。該授權頁結果不足時，「載入更多」直接銜接原有限制內的 CC0 頁。媒體、授權、來源檢查與額度仍適用。
- 移出三張舊版未引用且無逐檔授權紀錄的圖片。確認原公開路徑均回應 404，檔案仍可從既有 Git 歷史追溯。

## 驗收結果

| 驗收 | 結果 |
| --- | --- |
| `npm run lint`、`npm run typecheck`、`npm run build` | PASS |
| `npm test` | PASS，11 項，包括四語意象、24 筆歌曲資料線索、SQLite 額度、Commons CC0 分頁 |
| `npm run test:e2e` | PASS，32 項，含兩個既有視覺基準，以及歌詞同意、網路查詢只包含固定概念、返回歌曲資料、原生分享 payload 與複製退路 |
| 390×844、1440×900 實際瀏覽器 | PASS，使用受控 fixture 驗證「提供歌詞」、授權同意、橫向溢位及套用後焦點回復 |
| `npm audit --omit=dev` | PASS，正式依賴零已知漏洞 |
| Commons 實網 | `window rain` 攝影 HTTP 200、14 張。插畫 HTTP 200、首批候選全被篩除，CC0 後續頁同樣為空。 |
| MusicBrainz 實網 | PASS，24/24 筆最終各有相符錄音且都排在該次回應首位。來源曾多次間歇性失效，冷卻後用 `--from` 分段補驗。這是歌曲辨識驗收，圖片品質以實網樣例及本地回歸分別驗證。 |

[桌機歌詞流程](screenshots/lyrics-fixture-1440.jpg) · [手機歌詞流程](screenshots/lyrics-fixture-390.jpg)

## 尚存限制

固定詞庫擷取場景與物件，目前不包含模型級全歌語意理解。外部歌詞來源與 AI 維持停用，啟用需確認文本處理授權與零費用方案。共用 SQLite 額度適用同機程序，跨主機公開部署仍需確認共用儲存。Commons 插畫量受上游索引、授權與媒體篩選影響。原生分享已驗證瀏覽器收到的 payload，實體手機系統分享面板待驗。歷史中曾提交的舊憑證仍須由帳戶擁有人輪換。
