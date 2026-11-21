# 新四語歌詞的端到端驗收

2026-11-22（台北日期）。保留 Prompt V1、模型、參數、攝影檢索與媒材政策。四個完整短篇歌詞為本輪自撰，先寫下故事預期再請求 AI。使用正式 provider，單次呼叫、每例相隔至少一分鐘；上游未重試。這些是原創歌詞可行性測試，未取得商業發行歌曲的文本授權，不能代表真實商業曲庫泛化表現。

| 案例與預期 | AI 攝影詞／首批結果 | AI 插畫詞／首批結果 |
| --- | --- | --- |
| 中，山路悼念轉向共同歡笑 | backpack mountain trail 6 張，前三為背包客／山徑，場景吻合但看不出失落轉歡笑；ridge laughter 0 | backpack on trail 0；ridge laughter 0 |
| 英，臥室燭光的恐懼轉平靜 | bedroom candle 0；quiet candle flame 0 | candle beside bed 0；still flame 0 |
| 日，孤獨森林步道轉向接納安靜 | autumn forest path 16 張，首圖落葉森林步道貼近場景及沉靜；deep breath alone 0 | fallen leaves path 0；quiet breathing 0 |
| 韓，對球隊的希望轉向黑暗恐懼 | empty school courtyard 0；fence hiding 2 張，分別是貓及綠意巷道，沒有藏身恐懼 | empty school courtyard 0；hidden behind fence 0 |

四例均通過輸出驗證，耗時 0.96–1.48 秒。8 組攝影 4 組非空；8 組插畫全部為空。目視可載入的 11 張前三順位圖片，攝影首張場景與情緒均符合 1/8 組、至少一組攝影方向的首張符合則為 1/4 案。此評分較「有圖」嚴格；中文山徑只列部分符合。每張都由 Commons 的同一套來源、作者、媒材與 CC BY 4.0／CC0 驗證流程處理。

本輪沒有根據這些案例調參或寫歌曲對照。短詞數限制與格式成功不保證能搜到作品，抽象的動作與心理詞在新樣本再度失效。依既有研究收束插畫來源探索，現代插畫供應及可用 API 仍為未解決限制。既有免費提供者無法保證上述敘事畫面，此產品的圖片意境品質尚未達完成標準。

## 系統品質

- 新增可選的 provider 診斷 callback，CLI 可記錄狀態、finish reason、fingerprint 和 token 使用量。正式 API 不回傳診斷，不記錄歌詞、金鑰、原始回應或推理。
- 新樣本保存在 fixtures，既有 CLI 可用 new-zh、new-en、new-ja、new-ko 重跑，預期意境單獨列在結果中。
- 整理架構及授權文件中「雲端模型停用」「未取得測試金鑰」的過時說明。
- Lint、型別、production build 通過，單元／整合 18/18、Chromium 32/32、WebKit 12/12、雲端流程 fixture 2/2 通過。後續增加診斷斷言後重跑單元與型別亦通過。

## 重跑

沿用 README 的專用 Free/ZDR 設定及聯絡頁，執行 `npm run test:lyrics:cloud -- new-ja`。CLI 的 stdout 是測試結果，stderr 是不含原文的診斷。四例請分開執行並相隔至少一分鐘。

本輪額外用真實瀏覽器走 MusicBrainz 選曲入口，第一次歌曲請求回應 HTTP 503，按無自動重試原則停止。因而本輪新樣本的完整真實瀏覽器操作未通過；上表是直接共用正式 Groq／Commons adapters 的真實結果，不能替代這項驗收。先前 fixture 跨瀏覽器回歸仍通過。
