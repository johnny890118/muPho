# CC BY 4.0 與 CC0 攝影整合驗收

2026-11-19。保留 Prompt V1。比較 10 組原本固定攝影查詢和 8 組評估前定題的新查詢。新查詢測試圖片搜尋與排序，沒有重新測 Groq 或把診斷詞加入產品。

- **BY**：首批 CC BY 4.0，現行程式。
- **合併重排**：本機合併 BY 首批和既有 CC0 批次，以作品 ID 去重，沿用相同排序。此方法有兩個各最多 18 筆的原始樣本。
- **單次 OR**：Commons 用 `incategory:"CC-BY-4.0|CC-Zero"` 只取一個最多 18 筆批次，仍沿用逐件授權、媒材與作者檢查。這個批次由上游決定取樣，候選與前項不同。

逐張看最多前三張。**強相關**同時要求主場景清楚呈現及該方向的情緒吻合；多個畫面只見到局部構件或泛景時不推定為強相關。以下名次是最先出現的強相關作品，空包含不合格或不足三張。照片相同時沿用判定。原 10 組的兩批來自 11 月 18 日的已驗實網快照，單次 OR 和留出組於本輪實查，索引可能隨時間變動。

| 場景 | BY | 合併重排 | 單次 OR |
| --- | ---: | ---: | ---: |
| 原組首張強相關 | 4/10 | 3/10 | 2/10 |
| 原組前三張至少一張強相關 | 4/10 | 5/10 | 3/10 |
| 留出組首張強相關 | 2/8 | 3/8 | 3/8 |
| 留出組前三張至少一張強相關 | 4/8 | 6/8 | 6/8 |
| 兩組合計前三張至少一張強相關 | 8/18 | 11/18 | 9/18 |

| 原固定查詢 | BY 名次 | 合併名次 | 單次 OR 名次 | 目視重點 |
| --- | --- | --- | --- | --- |
| rainy window | — | 2 | 2 | 暗色雨滴玻璃與室內雨窗出現；首張仍是隔窗看街道。 |
| shoes at door | — | — | — | 店門、鞋底與告示牌。 |
| stormy sea | 1 | 1 | 1 | 波羅的海風浪對題；原三張均為海岸，混合兩種各只有兩張，河堰擠入第三。 |
| calm horizon | 1 | 1 | — | 海上夕陽保留於離線合併；單次 OR 只留下天空與剪影植物。 |
| open sea horizon | 1 | 3 | — | 開闊平靜的海景在合併下退居第三；單次 OR 前三張是岩岸、建築及機場。 |
| dark harbor lights | — | — | — | 仍是砲台紀實。 |
| snowy train station | 1 | 1 | 1 | 寂靜雪站仍在首張。 |
| snow on ticket | — | — | — | 電影票、雪屋及軍事紀實。 |
| empty alley streetlamp | — | — | — | 兩種授權都無合格圖。 |
| wet street friends | — | — | — | 混合結果仍是海灘。 |

| 留出查詢 | BY 名次 | 合併名次 | 單次 OR 名次 | 目視重點 |
| --- | --- | --- | --- | --- |
| foggy bridge | — | 1 | 1 | CC0 補上可辨識的霧中金門橋。 |
| candlelit room | — | — | — | 無合格圖。 |
| desert sunrise | — | 1 | 1 | CC0 補上沙丘日出，原池是火山日出與無日出的荒漠。 |
| empty playground | 2 | 2 | 2 | 第 2 張可辨認無人的遊具；兩個混合方法第 1 張是雪地長椅。 |
| autumn park bench | 2 | 2 | 2 | 原榜有秋樹下的座位，混合榜第 2 張有落葉公園長椅。 |
| rough mountain trail | — | — | — | 無合格圖。 |
| evening campfire | 1 | 1 | 1 | 黃昏營火穩定排首張。 |
| misty lake | 1 | 2 | 2 | 原首張的湖上霧氣清楚；混合首張為泛景，原首張仍在前三。 |

離線合併證實 CC0 能增加前三張相關作品的覆蓋，但未保護原有強首圖。單次 OR 守住一次請求的限制，卻在原組丟失兩個強首圖，前三張的強相關組數也由 4 降為 3。產品保留現在的 BY 首批及由使用者選擇的 CC0 分頁。沒有增加背景請求或重試。留出組可用於未來回歸，未據此修改排序。

[霧中金門橋](https://commons.wikimedia.org/wiki/File:Foggy_Day_Golden_Gate_Bridge.jpg) · [CirrusSearch 分類 OR 設定](https://github.com/wikimedia/mediawiki-extensions-CirrusSearch/blob/master/docs/settings.txt)

## 獨立插畫來源評估

- **Disabled And Here** 的官方插畫標籤頁共 26 個作品連結。實際開啟並目視抽查四件，包括朋友在天文館相聚、兩人坐著喝飲料、一起彩繪模型及收到工作肯定。原站逐件有作者、描述及 CC BY 4.0，四張都可載入；適合陪伴與日常情緒主題，是具體的免費候選。公開資料目前是作品頁與標籤；未驗證搜尋 API，這四張也未覆蓋本次雨窗、海浪、雪站等場景，未接入。 [官方插畫索引](https://affecttheverb.com/gallery/tags/illustration/) · [原始作品與署名](https://affecttheverb.com/gallery/disabledandhere/planetariumvisit/)
- **Open Doodles／Open Peeps** 為 CC0，有表情、動作及人物插畫；以素材套件為主，場景涵蓋度不足。 [Open Doodles 授權](https://www.opendoodles.com/about) · [Open Peeps 授權及素材](https://www.openpeeps.com/)
- **unDraw／Storyset** 有現代插畫，條款分別限制整合／大量再散布和收錄成素材庫。維持現有來源。 [unDraw 授權](https://undraw.co/license) · [Storyset 使用條款](https://storyset.com/terms)

## 重跑

設定 `MUPHO_PROVIDER_CONTACT` 後執行 `npm run test:photos:licenses -- holdout` 或 `npm run test:photos:licenses -- fixed`。可在最後加單一查詢，例如 `"foggy bridge"`。每一查詢依序取 BY、CC0 與單次 OR，上游失敗即停止。輸出 JSONL 含前三張作品與來源，人工核對場景、情緒和署名。
