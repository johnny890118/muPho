# MuPho 本機全詞意境可行性

2026-11-17（台北時間）。在 24 GiB Apple Silicon 安裝環境內，以 llama.cpp b12470 讀取 Qwen 官方 Apache 2.0 GGUF。權重從官方模型庫下載並核對 SHA-256。推論伺服器綁定 `127.0.0.1`，使用 `--offline`、`--no-webui`、`--log-disable`，只接受這份腳本內的自撰測試歌詞。模型與執行檔都在專案及 Git 之外，正式 MuPho 沿用瀏覽器規則式流程。[llama.cpp b12470](https://github.com/ggml-org/llama.cpp/releases/tag/b12470) · [Qwen3 4B](https://huggingface.co/Qwen/Qwen3-4B-GGUF) · [Qwen3 8B](https://huggingface.co/Qwen/Qwen3-8B-GGUF)

## 測試設計

腳本把完整自撰文本一次送入本機模型。開頭情緒、結尾情緒及場景都吻合預先標記才算通過。另人工檢視轉折敘述，格式合格也可能錯認情緒。標記涵蓋中、英、日、韓四種語言。英文另有海上情境反轉，以及一段末句才轉向平靜、接近 6,000 字元輸入上限的長篇。四筆額外樣本在確定提示後才加入。樣本數小且情緒界線有人為判斷。

| 模型／設定 | 結果 |
| --- | --- |
| Qwen3 4B Q4_K_M，結構化語法、不推理 | 首次提示 2/6，重排欄位與改寫提示 1/6。日文曾選錯場景，部分回應雖符合結構卻無有效敘述。 |
| Qwen3 4B Q4_K_M，JSON 解析、不推理 | 3/6，約 0.9–3.2 秒。三筆包含反轉或負面轉折的情緒標記不符。 |
| Qwen3 4B Q4_K_M，JSON 解析、推理上限 512 tokens | 原六筆 4/6，額外四筆 4/4。約 3–12 秒。韓文的重逢歡喜標成希望，反轉案例的起始平靜也標成希望。 |
| Qwen3 8B Q4_K_M，JSON 解析、推理上限 512 tokens | 原六筆 6/6、額外四筆 4/4，約 8–15.4 秒。長篇讀到末句，兩筆同場景但情緒相反的案例也可分辨。測試伺服器取樣 RSS 約 6.2 GiB。 |
| Qwen3 8B 額外抗干擾 | 1/1 約 12.4 秒。自撰文本內有要求覆寫結論的句子，模型仍辨識為孤獨轉向希望。 |

**可行性結論**：在本機硬體上，全詞輸入與離線推論可行。成功的模型判讀仍可能對應不佳的檢索結果。把三個模型場景帶入真實 Commons 攝影檢索，`rainy window` 得 16 張、首筆偏向雨天機場，`open sea` 得 15 張、首筆偏向船隻紀錄，`winter railway` 得 13 張、首筆是冬季鐵路橋的空拍。由於樣本少、檢索品管仍有限、手機執行和不同硬體尚待驗證，此輪保留可本機重跑的評估工具。正式產品維持既有規則式歌詞推薦。

## 重跑

4B 權重 2,497,280,256 bytes，SHA-256 `7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5`。8B 權重 5,027,783,488 bytes，SHA-256 `d98cdcbd03e17ce47681435b5150e34c1417f50b5c0019dd560e4882c5745785`。

```sh
llama-server --model /absolute/path/model.gguf --host 127.0.0.1 --port 3186 \
  --offline --no-webui --log-disable --no-context-shift --ctx-size 4096 \
  --parallel 1 --reasoning on --reasoning-budget 512
npm run test:lyrics:local
npm run test:lyrics:local -- --suite holdout
npm run test:lyrics:local -- --suite challenge
```

請以專用測試程序載入權重。測試工具只連固定 IPv4 loopback，拒絕重新導向，不會嘗試雲端。可選 `calibration`、`holdout`、`challenge` 或 `all`（前兩組），有任何格式或標記不符即回傳非零狀態。
