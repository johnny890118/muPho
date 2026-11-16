# MuPho 電影感介面重構

基線為 `codex/mupho-rebuild` 的 `435981d`。首頁 `app/page.tsx` 交給 Explorer 管理搜尋、候選、結果和收藏，WorkPreview 透過 shadcn／Radix Dialog 顯示作品。全域色彩在 `app/globals.css`。搜尋路由以 SQLite 統一共用限額、快取與冷卻，再呼叫 MusicBrainz 與 Wikimedia Commons。既有測試覆蓋來源欄位、共用額度、候選、分頁和分享。

## 初步重現

2026-11-17 以現有本機 API 和真實來源執行少量請求。

| 舊版請求 | HTTP | 實際結果 |
| --- | --- | --- |
| 歌曲 `晴天 — 周杰倫` | 200 | 正確藝人與多個版本，首筆 ID `729c6839-a400-41aa-aeb1-dfe657dc8be2` |
| 歌曲 `晴天-周杰倫`、`晴天 周杰倫` | 兩筆 200 | 兩筆均零候選。舊解析只拆兩側都有空白的 dash |
| 歌曲 `晴天` | 200 | 周杰倫在首位，也提供其他藝人 |
| 攝影 `sunlight school bicycle` | 200 | Commons 搜尋索引只有 1 個候選，MuPho 篩選後 0 張，無後續頁 |
| 攝影 `school corridor` | 200 | 18 張通過同一套篩選 |

帶長破折號的歌曲已辨識成功，選定曲目後送入 Commons 的詞組過窄，才是此流程空結果的主因。其他輸入寫法另有歌曲解析問題。修正以受控 fixture 驗證，再分開作少量實網測試。

## 畫面與實作順序

- [01 桌機首頁](references/01-desktop-home.png) → 暖白 serif 品牌、圖像暗角與精簡搜尋。以原始來源核對氛圍照片。
- [02 桌機結果](references/02-desktop-results.png)、[04 手機結果](references/04-mobile-results.png) → 共用搜尋列、送出後收起封面、精簡曲名與媒材切換，圖片在第一屏。
- [03 桌機預覽](references/03-desktop-preview.png)、[05 手機預覽](references/05-mobile-preview.png) → 桌面圖片與資訊雙區，手機圖片優先、操作集中於底部。
- Phase B 建立設計 tokens 與首頁，C 修復解析、視覺搜尋與結果狀態，D 完成預覽與收藏細節，E 驗證四種視窗、現有功能與截圖。
- 歌曲資料推薦保留日後完整歌詞分析的接點。只調整檢索策略及使用者呈現，沿用真實來源、授權篩選及額度。稀少插畫、503 與配額耗盡以明確狀態呈現。
