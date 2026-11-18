# MuPho 營運與額度

可在已有 Node.js 主機執行 `npm run build`、`npm start`。同機多程序需共用同一個本機持久 SQLite 絕對路徑及工作階段秘密。SQLite WAL 不適用網路檔案系統。現有主機的維運、電力、頻寬依環境而定，未核實任何跨主機平台的零費用條件。環境設定缺少時搜尋路由回應 503。

| 服務 | 每位訪客每小時／日 | 全站每小時／日 | 單次並行數 |
| --- | --- | --- | --- |
| MusicBrainz | 12／36 | 60／240 | 1，請求間隔至少 1.1 秒 |
| Wikimedia Commons | 20／60 | 90／360 | 1，請求間隔至少 1 秒 |
| GroqCloud 全詞分析（選擇啟用） | 2／6 | 12／36 | 1，兩次啟動至少相隔 60 秒 |
| 外部歌詞來源 | 關閉 | 關閉 | 0 |

上限是 MuPho 的保守設定，非上游保證。時段以 UTC 計算。在同一交易檢查並扣除各額度，實際呼叫後即使失敗也保留扣款。命中快取不扣額度。API 處理上游 429、5xx、逾時及 Retry-After，回傳本地化錯誤代碼。上游 429／5xx 冷卻至少 30 秒。快取 TTL 一小時，逾期資料在後續請求清除。停用搜尋可設 `MUPHO_ENABLE_SEARCH=0` 後重啟。

搜尋文字用雜湊鍵索引，快取保留回傳的衍生資料與作品文字。簽章匿名 Cookie 期限一天，且可由訪客清除。公開環境應由可信反向代理覆寫專用 IP header、阻擋直接繞過代理，才設定 `MUPHO_TRUSTED_IP_HEADER`。MuPho 以 HMAC 轉換 IP 作每小時限制，不儲存原始 IP。IPv6 位址輪換與 cookie 重新取得仍可能分散個人限制，全站硬額度持續適用。需要多台主機或無持久磁碟時，維持外部搜尋停用，直到配置經核實的共用原子化儲存。

以 `MUPHO_REPORT_URL` 提供有效的 HTTPS 回報管道。管理者在 `MUPHO_BLOCKED_COMMONS_IDS` 設定以逗號隔開的 Commons page ID 後重啟，搜尋快取鍵也會更換。封鎖清單也隱藏首頁示範及收藏內的相符作品。瀏覽器內的收藏來源資料可能過期，使用者可取消收藏。

輪換 Git 歷史中的舊憑證及曾由前端載入的 Pexels 金鑰。舊版 `.env` 變數不供新程式使用。

GroqCloud 僅支援專用 Free 組織、無付款方式、啟用 ZDR。應用程式無法從金鑰辨別帳戶方案；管理者確認後才設定 `MUPHO_GROQ_FREE_ZDR=1`。此旗標沒有變更供應商帳戶的權限。Groq 固定只用 GPT-OSS 20B、每次最多 6,000 字元和 768 output tokens；原文與 AI 回傳值不寫入 SQLite，請求失敗仍計入額度。攝影或插畫的兩次獨立搜尋沿用 Wikimedia 額度；上游失敗時停止該批。

`main` 透過 `vercel.json` 停用 Vercel Git 自動部署。Git 推送與正式環境部署分開。公開搜尋仍需符合上述資料庫與額度條件。[Vercel Git 設定](https://vercel.com/docs/project-configuration/git-configuration)
