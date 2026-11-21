# 歌詞視覺轉譯的有限實驗

正式應用程式固定使用 lib/providers/groq.ts 的 Prompt V1，實驗工具只在自身程序攔截並替換 system message。其他參數、schema、輸出檢查、圖片 adapter 與首批授權條件共用正式程式。

先設定伺服器用 Groq Free/ZDR 環境與 MUPHO_PROVIDER_CONTACT，使用 node --env-file=/absolute/path/.env.local --import tsx tests/experiments/lyrics-prompt.ts development a new-ja。version 可選 v1、a、b，suite 可選 development、final。每次只執行一個案例，失敗不重送。

development 使用 lyrics-holdout.json，final 使用 lyrics-final.json。在檢視 final 前鎖定版本，final 不再用來調整提示。stdout 保存輸出與前三張圖片，stderr 只有狀態及 token 指標，不包含金鑰、歌詞或推理。請求採單次、序列，測試完成後不保持背景工作。

如需同一天重新檢索既有 V1 模型輸出，可以執行 node --import tsx tests/experiments/replay-lyrics-images.ts /absolute/path/saved-output.jsonl。重播不請求 AI，與模型新推論分開計數。

以每方向為分母，記錄有效輸出率、非空率、首張強相關率、前三張強相關率。強相關需同時滿足故事場景與該方向情緒。模型失敗的兩個方向及空圖片查詢均計零，亦列出成功輸出的條件分母。插畫獨立統計，不用攝影代替。只有模型輸出率、圖像品質及留出驗收皆達到預定條件，才另行提出採用建議。

本次最多 A、B 兩輪，任一輪未達標即保留正式 V1，沒有自動提升或正式實驗旗標。

## 三階段獨立實驗

three-stage.ts 與 visual-three-stage.txt 是後續單版實驗，不開放正式切換。先讀 docs/verification/three-stage-experiment.md 的預先固定條件與限制。以既有 Free/ZDR 環境，執行 `node --env-file=/absolute/path/.env.local --import tsx tests/experiments/run-three-stage.ts /absolute/path/new-evidence-directory`。輸出目錄必須尚不存在，矩陣固定 11 次、序列、無重試。單例工具供診斷使用，請勿重跑失敗條件以挑選成功回答。Runner 繼承環境而不讀取或保存金鑰。

新 Schema 增加 meaning 字串及 primary/secondary 的 scene，兩方向不對應首尾。與 V1 比較時皆沿用正式短詞檢查及 Commons adapter，但新版本使用 2048 completion tokens，V1 維持 768。新產物僅留於實驗證據，不進 UI 或正式 API。診斷只記錄 failed_generation 長度與 JSON 可解析性，不儲存其內容。留出不得用來改提示。
