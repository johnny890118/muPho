# MuPho 雲端全詞找圖驗收

固定模型 `openai/gpt-oss-20b`、Prompt `mupho-visual-v1`、temperature 0.1、top_p 1、seed 7、medium reasoning、最多 768 completion tokens。Groq 對 seed 僅提供盡力重現。測試工具和產品共用 provider 與輸出驗證。每方向各產生攝影與插畫的 1–3 個英文搜尋詞。

## 驗收方式

- `npm run test:cloud` 以受控回應驗證桌機與手機選曲、改選、明確同意、兩個獨立搜尋、媒材切換、預覽與焦點復原。
- 實網驗收需設好 README 的 Free/ZDR 環境與聯絡頁。執行 `npm run test:lyrics:cloud --silent -- zh`，再以同一方式跑 `en`、`en-reversal`、`ja`、`ko`，每個案例間隔至少一分鐘。工具只送自撰歌詞，遇到上游錯誤即停止。再於實際應用程式走一次真實選曲、貼上同一首自撰歌詞、同意與換媒材。
- 前三筆逐一開啟來源及縮圖，分開標記場景、情緒、轉折、媒材及授權。品質分數 2 表示主要場景與情緒均符合，1 表示只有場景或物件相符，0 表示空結果或呈現相反情緒。比較兩個海上案例，確認結尾反轉實際改變搜尋與圖片。先擱置任何不符合媒材或授權的候選。

## 2026-11-18 實網結果

首輪五個自撰案例有 4/5 通過模型格式驗證。平靜結尾的英文案例首跑只回報 `offline`；保留原失敗紀錄，另以相同參數執行一次帶診斷紀錄的人工重測，Groq 回傳 HTTP 200，未能重現首跑問題。五筆有效回應耗時 1.07–1.54 秒。未記錄金鑰、推理或原文於報告。

| 樣本 | AI 攝影詞與結果 | AI 插畫詞與結果 |
| --- | --- | --- |
| 中文，等候轉希望 | `rainy window` 16 張，首張隔著雨窗看機場（1）；`shoes at door` 13 張，首張餐廳門口（0） | `rainy window`／`shoes at door` 各 0 張 |
| 英文，恐懼轉平靜（診斷重測） | `stormy sea` 7 張，首張風浪與陰雲（2）；`calm horizon` 4 張，首張湖邊草地（1） | `windy deck`／`peaceful waves` 各 0 張 |
| 英文，平靜轉恐懼 | `open sea horizon` 9 張，首張為機場（0）；`dark harbor lights` 18 張，首張為石碑（0） | `deck rail`／`hand gripping rail` 各 0 張 |
| 日文，希望轉悲傷 | `snowy train station` 10 張，首張是寂靜雪站（2）；`snow on ticket` 6 張，首張是雪屋（0） | `ticket in hand`／`ticket in snow` 各 0 張 |
| 韓文，孤獨轉喜悅 | `empty alley streetlamp` 0 張（0）；`wet street friends` 1 張，首張是海灘（0） | `lonely alley lamp`／`hand holding friend` 各 0 張 |

人工目視全部 25 張實際返回的前三順位縮圖。10 組攝影查詢有 9 組返回作品，首位 2 組符合場景與該方向情緒，2 組部分符合，6 組不符或為空。10 組插畫均為空。兩首英文的結尾產生可區分的線索（平靜地平線／暗處港燈），但首張圖片沒有重現海上情緒反轉。另有一件梵谷畫作的翻拍混入攝影前三名。此輪驗證出 AI 能擷取場景和轉折中出現的物件，尚未通過最終圖像品質驗收。

[雪站首張](https://commons.wikimedia.org/wiki/File:Delta_train_station_on_a_snowy_day_(Auderghem,_Belgium).jpg) · [港燈首張](https://commons.wikimedia.org/wiki/File:Plaque_at_Battery_Russell_in_Fort_Stevens_State_Park.jpg) · [攝影誤判的翻拍](https://commons.wikimedia.org/wiki/File:Beach_at_Scheveningen_in_Stormy_Weather_-_Vincent_Van_Gogh.jpg)

實網瀏覽器以 MusicBrainz 預選〈晴天〉，使用自撰中文歌詞取得 Groq HTTP 200。首次切換插畫時碰到 Commons 共用間隔。修正後以同一流程驗證一次 AI 呼叫、四次獨立圖片查詢、原始來源連結與預覽焦點復原。插畫正確顯示空結果。重跑 lint、型別、正式 build、單元／整合 15/15、Chromium 32/32、WebKit 12/12 及雲端流程 fixture 2/2 均通過。

下一輪分別比較較短的媒材別查詢（保留主要名詞，搭配可見的光線或動作）與更強的 Commons 主題證據及媒材篩選。固定這五首及獨立保留樣本，逐方向對照前三張的場景與情緒分數。保留目前的有限額、無自動重試與授權門檻。

## 圖片來源對照

用人工控制詞驗證 Commons，不計作 AI 成績。已目視核對首張縮圖。

| 媒材與控制詞 | 合格件數 | 首張內容 |
| --- | ---: | --- |
| 攝影 `raindrops window` | 13 | 夕陽下的車窗雨滴，雨窗清楚，情緒可作多種解讀。 |
| 攝影 `ocean horizon` | 13 | 平靜海面及遠方地平線，符合開闊和平靜。 |
| 攝影 `train snow` | 17 | 雪地行駛列車，題材正確，未呈現等候離別。 |
| 插畫 `rain` | 3 | David Revoy 的雨後小巷符合雨後氛圍，其他候選有古籍圖。 |
| 插畫 `night street`／`ocean waves` | 0／0 | 首批沒有合格插畫。 |

The Met Open Access API 免金鑰，逐件取回 `isPublicDomain` 和圖片。小樣本中 `rain street` 首筆為對題雨街蝕刻；`ocean waves` 的前兩筆均是海難版畫，`snow train` 前兩筆為無開放圖像蝕刻與聖誕版畫。先保持研究候選。Openverse 的授權須回原站核實，條款也保留特定用途收費，暫未接入。
[The Met API](https://metmuseum.github.io/) · [Openverse 條款](https://docs.openverse.org/terms_of_service)

## 本地結果

Lint、型別、正式 build 通過。單元／整合 15/15，Chromium 32/32，WebKit 12/12，桌機及手機雲端流程 fixture 2/2。測試覆蓋同源、同意、原文不落庫、配額、單次送出及分媒材搜尋。雲端瀏覽器案例的上游回答皆為固定測試資料。
