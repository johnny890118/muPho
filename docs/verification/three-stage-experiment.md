# 三階段視覺轉譯隔離實驗

## 預先固定的設計

2026-11-22。只實驗一版，不據圖片結果調詞。正式 V1、UI、Commons 搜尋與排序均不改動。兩個開發例 long-en（長篇與重複副歌）、turn-ja（歡樂轉哀傷），兩個未參與調整的留出 fresh-zh（孤獨轉陪伴）、fresh-ko（緊張轉勇氣）。四篇皆新自撰完整歌詞，不涉及外部歌詞權利；預期意境在呼叫前固定於 fixture。這是小樣本探索，不能代表商業歌曲曲庫。

新版本一次 Groq 呼叫產出簡短全文意境摘要、兩個具體畫面描述及各畫面的攝影／插畫詞。不要求內部推理，不強制開頭／結尾各一方向。固定 openai/gpt-oss-20b、temperature 0.1、top_p 1、seed 7、medium reasoning、include_reasoning false。V1 維持 768 completion tokens，新版因增加公開可檢驗的產物用 2048，皆維持 12 秒逾時。故本輪比較的是完整候選配置，不能把差異全歸功於 Prompt。

格式診斷三條件以同一 long-en 測例各執行一次。原 B 提示與正式 schema 配 768、B 配 2048、簡單固定答案配正式 schema 及 768。只保存 HTTP、錯誤碼、失敗產物長度及是否可被 JSON.parse 解析，不保存或展示 failed_generation 或內部推理。不同條件不是失敗後的自動重試。先完成診斷，再執行固定的四組 V1／新版配對，不做額外調參。

總共預定 11 次 AI 呼叫，序列執行，每次結束後至少等 32 秒；圖片每方向獨立搜尋兩種媒材，查詢間至少 1350ms。不自動重試，不接入其他供應商。沿用已確認的 Free／ZDR 設定，不啟用付費。

評分以每例預期兩方向為分母，模型失敗與空結果均計零。逐張查看前三圖，場景與情緒都吻合才算強相關；首圖強相關率與前三張至少一張強相關率分開。另列非空率、圖片可見率與授權。插畫獨立統計。採用建議需新版有效輸出率不低於 V1，且開發及留出兩組的首圖／前三圖均無退步，合計至少多兩個強相關方向；否則不建議整合。單人評分不是盲測，應揭露偏差與小樣本限制。

## 結果

### 格式診斷

| 固定條件 | HTTP／結束 | completion tokens | 指紋 |
| --- | --- | ---: | --- |
| B，正式 Schema，768 | 200／stop | 620 | fp_9340e7d14d |
| B，正式 Schema，2048 | 200／stop | 1081 | fp_e189667b30 |
| 簡單固定答案，正式 Schema，768 | 200／stop | 221 | fp_9b8528b477 |

三次均通過正式輸出檢查。這證明該模型與這個 Schema 在本輪條件下可以運作，不能把上一輪八次 json_validate_failed 視為語意失敗，也無法證明它們都是長度問題。提高 budget 的呼叫確實用了超過 768 的 tokens，但 768 那次也成功，且指紋不同；無法以這三筆隔離因果。上輪未保存 failed_generation 與長度細節，不能事後推斷其失敗內容。新診斷會保存安全統計，但本輪沒有重現該錯誤，因此沒有可分析的失敗產物。

### 圖片配對

| 指標 | V1 | 三階段 |
| --- | ---: | ---: |
| 有效模型輸出 | 3/4 | 4/4 |
| 實際攝影／插畫查詢 | 6／6 | 8／8 |
| 攝影有圖方向 | 6/8 | 6/8 |
| 攝影首張強相關 | 2/8 | 2/8 |
| 攝影前三張至少一張強相關 | 3/8 | 3/8 |
| 插畫有圖方向 | 0/8 | 0/8 |

開發兩例的攝影首張／前三張為 V1 2/4、3/4，新版 1/4、2/4。留出兩例為 V1 0/4、0/4，新版 1/4、1/4。條件於有效模型輸出的攝影有圖率則為 V1 6/6、新版 6/8。不能只用條件成功分母掩蓋 V1 的格式失敗，也不能只用新版的 JSON 成功率宣稱圖片品質提升。

共目視 34 個前三張位置的攝影縮圖，V1 16、新版 18，全部成功載入。作品不一定跨查詢唯一。評分用 0 不相關、1 主題相關但情緒或場景不足、2 場景與情緒皆符合；逐張評分與理由保存在資料檔。全部為目前 adapter 驗證的 CC BY 4.0、含作者及來源頁，沒有接入新授權或降低條件。縮圖對照保留作者及授權，完整來源連結見資料檔；縮放排版不改原圖內容。不能把來源標示視為對所有第三方權利的法律保證。

| 案例 | V1 攝影詞與結果 | 新版攝影詞與結果 |
| --- | --- | --- |
| long-en | rainy station platform 首圖灰雨空站貼近等待；folding ticket 是票券展示與會議，沒有釋懷。 | rainy platform 首圖有人群，第二張空月台較好；dawn station 首圖黎明空站符合接受。 |
| turn-ja | morning beach 第二張明亮海岸符合夏日活力；empty beach chair 的黑白空椅能表達缺席。 | beach sunrise 首圖是同名機場草地；lonely beach 三張為同名景點度假人物照，沒有缺席意象。 |
| fresh-zh 留出 | HTTP 200、stop、386 completion tokens，但正式檢查 invalid_output，未搜尋，不重送。 | dim apartment interior、neighbor bread 兩方向均空。 |
| fresh-ko 留出 | backstage curtain 為防火幕設備與紡織物；stage light 為燈具與烘手機，未表達勇氣。 | backstage dressing room 為合照、更衣室與換衣棚；stage spotlight 首圖與第二張表演者聚光畫面符合上台勇氣。 |

中文 V1 的失敗是本機輸出檢查未通過，與供應商 json_validate_failed 不同。該次未保存被拒絕的 content，無法事後分辨是短詞限制、重複方向或其他 schema 條件；不推斷原因。其 completion tokens 未達 768、finish_reason 為 stop，沒有觀測到 length 截斷。新版四次都 stop，完成 tokens 分別 558、378、765、750，沒有 length 截斷。本輪不把這些成功外推為可靠性已充分驗證。

### 分層發現

1. 全文理解。新版中文抓到孤獨轉陪伴；韓文抓到緊張轉勇氣。但英文將失落後的接受概括為自由，日文將不再歸來的朋友淡化為離開，核心失落意義不夠精準。V1 未輸出摘要，不能從其詞語倒推出相同層級的理解分數。
2. 畫面構思。產物提供可檢驗的具體畫面，沒有強迫首尾分工。但英文仍自然採用等待與黎明兩景，並新增原文沒有的閃爍燈光；第一景超過提示的 20 字上限。韓文新增更衣室，尚屬舞台聯想，但偏離原本幕後孤身空間。這些是內容品質問題，不是 JSON 失敗。
3. 搜尋詞。dawn station 與 stage spotlight 改善個別方向；neighbor bread 仍是罕見組合，dim apartment interior 仍無合格召回。beach sunrise 被同名機場命中，lonely beach 被地名人物照主導，證明常見短詞不等於可用視覺搜尋詞。來源覆蓋、查詢匹配與排序共同影響結果，這次沒有改動它們，亦未據首批結果宣稱整個來源沒有作品。

所有插畫查詢均沒有合格結果，獨立記為現行來源與篩選下的缺口。未用古典版畫、攝影或數量充成功，沒有展開新一輪來源研究。

### 結論與下一步

未達預先門檻。新版在開發組退步、總首圖及前三圖都沒有增加，故不建議整合，正式 V1 保持原樣。單次模型有效率從 3/4 到 4/4 不能視為已證明可靠性優勢。到此結束本輪，不追加提示版本或重送失敗案例。

可保留三階段產物作日後實驗的觀測介面。下一步若獲准繼續，應先補足實驗端本機輸出拒絕的安全分類診斷，避免只剩 invalid_output；再針對通用查詢的地名誤命中及少詞長尾召回設計有限檢索實驗，固定這批詞、區分候選池與排序，無需再調 Prompt。主流 API 仍待適用許可，不接入；本輪不提出正式來源替換。

### 驗證與產物

Lint、TypeScript、18 項既有測試通過，git diff --check 通過。本輪只新增實驗工具、fixtures 與證據，沒有改產品程式或 UI，因此未重跑產品瀏覽器回歸；截圖是實際 Commons 縮圖對照，並非 UI 改版驗收。原工作目錄未提交的模型試作保持原樣。無模型下載、無新服務、無自動重試、無部署。

實際執行固定矩陣使用外部 shell launcher，與提交的 run-three-stage.ts 相同 11 個條件及 32 秒間隔；沒有為驗證 runner 再呼叫 API。CLI 共用 Free/ZDR 金鑰條件，但未走正式路由的 SQLite 訪客配額，使用明列的有限呼叫計數；不能將此實驗宣稱為正式額度回歸測試。

- [安全輸出、診斷、逐圖分數與來源](data/three-stage-experiment.json)
- [英文 V1 圖片](screenshots/three-stage/v1-long-en-contact.jpg) · [三階段圖片](screenshots/three-stage/three-long-en-contact.jpg)
- [日文 V1 圖片](screenshots/three-stage/v1-turn-ja-contact.jpg) · [三階段圖片](screenshots/three-stage/three-turn-ja-contact.jpg)
- [韓文 V1 圖片](screenshots/three-stage/v1-fresh-ko-contact.jpg) · [三階段圖片](screenshots/three-stage/three-fresh-ko-contact.jpg)
- [中文三階段空結果](screenshots/three-stage/three-fresh-zh-contact.jpg)
