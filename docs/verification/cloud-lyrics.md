# MuPho 雲端全詞找圖驗收

固定模型 `openai/gpt-oss-20b`、Prompt `mupho-visual-v1`、temperature 0.1、top_p 1、seed 7、medium reasoning、最多 768 completion tokens。Groq 對 seed 僅提供盡力重現。測試工具和產品共用 provider 與輸出驗證。每方向各產生攝影與插畫的 1–3 個英文搜尋詞。

## 驗收方式

- `npm run test:cloud` 以受控回應驗證桌機與手機選曲、改選、明確同意、兩個獨立搜尋、媒材切換、預覽與焦點復原。
- 實網驗收需設好 README 的 Free/ZDR 環境與聯絡頁。執行 `npm run test:lyrics:cloud --silent -- zh`，再以同一方式跑 `en`、`en-reversal`、`ja`、`ko`，每個案例間隔至少一分鐘。工具只送自撰歌詞，遇到上游錯誤即停止。再於實際應用程式走一次真實選曲、貼上同一首自撰歌詞、同意與換媒材。
- 前三筆逐一開啟來源及縮圖，分開標記場景、情緒、轉折、媒材及授權。品質分數 2 表示主要場景與情緒均符合，1 表示只有場景或物件相符，0 表示空結果或呈現相反情緒。比較兩個海上案例，確認結尾反轉實際改變搜尋與圖片。先擱置任何不符合媒材或授權的候選。
- 目前未取用 Groq 帳戶，模型輸出與端到端實網驗收待驗。

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
