# 主流攝影 API 適用性與對照前置驗證

核對日期 2026-11-22。保留正式 V1、Commons、UI、插畫限制與全部未提交試作。僅查官方文件及本機設定名稱，未呼叫 Pexels／Unsplash 圖片 API，未建立帳戶或代表使用者聯絡供應商。

## 額度及適用性

| API | 免費額度 | 適用性核對 | 本輪實圖對照 |
| --- | --- | --- | --- |
| Pexels | 每小時 200、每月 20,000 次 | 禁止複製其核心服務、部分圖庫／桌布型態及未加工圖片的獨立再散布。音樂語意轉譯是否構成足夠額外功能，未取得適用於 MuPho 的說明。目前新金鑰發放及擴額申請暫停。 | 未執行，品質未知 |
| Unsplash | Demo 每小時 50 次，官方指公開使用應申請 Production | 圖片及 API 條款限制類似／競爭服務；須用回傳圖片 URL 熱連結、署名與帶參數的作者連結，類下載選用事件須回報 download_location。API 條款對 AI 相關用途另指向資料授權。文本 AI 產詞後檢索與產品流程的適用性需釐清。 | 未執行，品質未知 |

免費與適用性分別判定。沒有證據能把這兩家判為 MuPho 已獲准使用，也沒有把「使用 AI」本身解讀為所有搜尋都遭禁止。以上是依具體流程與條款的工程評估，供應商尚未作出 MuPho 個案判定。兩家的圖片均不能直接填入現有 CC BY／CC0 欄位。

Pexels 的官方 API 使用說明特別限制未經同意的大規模收集內容或 metadata 用於模型訓練、評估及資料集。這次規劃為少量、人工逐圖比較檢索結果，沒有使用圖片訓練或外送視覺模型；仍應一併說明並確認試驗範圍。[Pexels API 條件](https://help.pexels.com/hc/en-us/articles/900005880463-What-are-the-Terms-and-Conditions/)

本機僅發現舊 .env 的 NEXT_PUBLIC_PEXELS_API_KEY 名稱。它屬於先前文件已記載曾外露的舊設定，本輪未使用。沒有發現 Unsplash 金鑰；也沒有把金鑰值輸出或提交。

[Pexels 免費與額度](https://help.pexels.com/hc/en-us/articles/47677890260761-Is-the-Pexels-API-free-to-use) · [新 Key 暫停](https://help.pexels.com/hc/en-us/articles/900004904026-How-do-I-get-an-API-key) · [Pexels 圖庫類應用限制](https://help.pexels.com/hc/en-us/articles/4405588861721-Can-I-use-the-API-as-a-wallpaper-app) · [Pexels 完整條款](https://www.pexels.com/terms-of-service/)

[Unsplash 免費測試及公開使用](https://help.unsplash.com/en/articles/3887917-when-should-i-apply-for-a-higher-rate-limit) · [Unsplash API 規範](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines) · [Unsplash 圖片授權](https://unsplash.com/license) · [Unsplash API 條款第 12 節](https://unsplash.com/api-terms)

## 可執行的對照範圍

獲確認及測試用金鑰後，每家先取相同 18 組 V1 攝影詞的第一頁、相關性排序、前三張，最多 18 次搜尋請求。十組來自原五首歌詞，八組來自新四語歌詞。固定詞直接取既有 V1 結果，不再向模型改詞、不以查無結果觸發退讓或重試。

逐張保存來源、作者、媒材、來源授權與日期，以同一原始場景及方向情緒判定，另給構圖、光線、主體清晰度與是否足以供使用者表達心情的美感分數。空結果和服務錯誤分開；前三張不足三張時保留空位。來源排名保持不變。先依來源規定的 URL 顯示、署名及事件追蹤方式驗證，不能將網站手動挑圖當作 API 搜尋結果。首次 429／5xx 停止該來源，輸出已完成及未完成部分。

正式接入的決定需同時具備適用性、NT$0 條件及比 Commons 更好的實圖品質。當前決定是保留 Commons。沒有 Pexels／Unsplash 成績或優勝者；本輪的前置驗證完成，圖片品質對照仍受金鑰及使用範圍確認所阻。

## 可由擁有人送出的詢問草稿

以下兩封均未寄送。請依實際註冊資料提供測試截圖／專案頁，勿附 API Key。若同意先做上述限量測試，可請供應商分別回答測試許可與日後公開使用。

### Pexels — api@pexels.com

Subject: MuPho music-to-photo discovery — API eligibility and small evaluation

Hello Pexels API team,

I maintain MuPho, a music-to-image discovery project. A user selects a song and pastes complete lyrics they have permission to process. A text-only AI produces two short English visual search phrases. MuPho would display photography results in a gallery, let users preview and save references locally, and share a message containing song information, photographer credit and a link to the original photo. Direct image search is also available. Original files would be accessed through the source.

The images and image metadata would not be used to train or fine-tune models or sent to a vision model. We would like to manually compare the first three results of 18 fixed searches against Wikimedia Commons, assessing scene, emotion and visual quality.

Does this product qualify under your restrictions on image galleries, competing services and standalone distribution? Is the small manual comparison permitted? If so, can it run entirely within the free API tier? We saw the notice that new API key issuance is paused. Is an eligible evaluation currently possible?

We can provide screenshots showing attribution and the complete flow. We will keep the existing source until we understand the permitted scope.

Thank you.

### Unsplash — api@unsplash.com

Subject: MuPho song-mood photo discovery — API eligibility and free demo evaluation

Hello Unsplash API team,

I maintain MuPho, a music-to-image discovery project. A user selects a song and supplies lyrics they have permission to process. A text-only AI converts the lyrics into two short English visual search phrases. The application would display photos, allow previews and local bookmarks, and share a message with song information, photographer attribution and an original-source link. Direct image search is also available.

We would use API-provided hotlinked URLs, photographer and Unsplash attribution, referral parameters, and the required download-event tracking for qualifying selection or use actions. Photos and metadata would not be used for model training or fine-tuning or sent to a vision model.

Is this flow eligible under your API and similar-service restrictions? Does text-generated search implicate the AI/data provisions of section 12 when the returned images are only displayed and manually reviewed? May we conduct an 18-query manual comparison of the first three results within the free Demo allowance, and would public use require any paid licensing or additional approval?

Please distinguish permission for this limited evaluation from eligibility for a future public product. We can provide screenshots and attribution examples.

Thank you.
