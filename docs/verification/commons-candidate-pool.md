# MuPho Commons 候選池與排序稽核

2026-11-18。使用 [固定五首與 20 組原詞](image-source-comparison.md)，不呼叫 AI。每組納入應用首批 CC BY 4.0 與既有的 CC0 補充頁，逐一保存 Commons 回傳的候選、資格及排名。每批最多 18 筆，沒有遍歷整個 Commons 或其餘 CC BY 分頁。兩種授權頁是分開的固定樣本。

首批 158 張均載入。補充頁 150 筆中 142 張在兩次版本對照中至少載入一次，8 個位置只有 metadata 可核對，不給視覺分數（7 個在 `snow on ticket`、1 個在插畫 `ticket in snow`，其中一張重複）。目視同時符合方向的場景及情緒才記為強相關；純對物件、地點或天氣為部分符合。英文反轉案的 `open sea horizon` 評估平靜的開場，`dark harbor lights` 評估轉向恐懼的結尾。

## 指標

| 指標 | 舊版 | 改善後 |
| --- | ---: | ---: |
| 首批攝影原始／合格件數 | 140／85 | 140／85，作品 ID 集合相同 |
| 首批攝影池至少一張強相關 | 5/10 | 5/10 |
| 首批攝影首張強相關 | 2/10 | 4/10 |
| 首批攝影前三張至少一張強相關 | 4/10 | 4/10 |
| 攝影池有強相關的 5 組，首筆強相關倒數排名平均 | 0.60 | 0.83 |
| CC0 攝影原始／合格件數 | 114／0 | 114／57，8/10 組有合格圖 |
| 首批＋CC0 插畫原始／合格件數 | 54／0 | 54／0 |

## 逐組攝影診斷

原始池／合格池為首批筆數，名次是最早出現的強相關作品。CC0 欄為修正後合格數。

| 查詢 | 首批原始／合格 | 強相關名次舊→新 | CC0 | 已看到的原因 |
| --- | ---: | --- | ---: | --- |
| `rainy window` | 18／16 | 7→7 | 15 | 靜謐雨窗在第 7；其西文標題與雨窗的類別證據比機場標題弱。新首張為隔窗的摩天輪，仍只有部分匹配。補充池可找到雨滴玻璃及暗室雨窗。 |
| `shoes at door` | 18／13 | — | 8 | 店門、鞋店、相似合照占池；補充池有門邊童鞋，但意境偏向遺失。短詞 `shoes` 有 14 張，證實可找到鞋，未證實門口盼望的完整場景。 |
| `stormy sea` | 18／8 | 1→1 | 4 | 首批與補充頁都有風浪海岸，原排序已有效。 |
| `calm horizon` | 18／4 | 2→1 | 1 | 湖岸草地標題含 horizon；海上夕陽用說明同時描述 calm 與 horizon，已升首張。 |
| `open sea horizon` | 18／9 | 3→1 | 17 | SEA 機場代碼及 Horizon 航空／校名拿到字面分；平靜海景的敘述有實際主題證據。補充池另有真正的海平線。 |
| `dark harbor lights` | 18／18 | — | 0 | 首批是同一砲台的紀實系列，重排救不了。`night harbor` 找到 17 張，含夜間碼頭燈光；恐懼情緒仍無保證。詞與索引互動是主因。 |
| `snowy train station` | 13／10 | 1→1 | 4 | 空雪站確實符合，補充頁也有雪地列車。 |
| `snow on ticket` | 18／6 | — | 6 | 首批是雪屋／軍事，補充池的 Snow White 是片名，另有售票機。 `train ticket` 有 10 張，證實票券供應，無法證實有下雪與等待的關鍵畫面。 |
| `empty alley streetlamp` | 0／0 | — | 0 | `night alley` 找到 15 張，含空巷及窄街燈光。原詞合取過窄；後者只是診斷控制。 |
| `wet street friends` | 1／1 | — | 2 | 原詞兩池都是海灘；`wet street` 找到 12 張含雨街，但沒有證明重逢題材。 |

## 逐組插畫診斷

| 固定查詢 | 首批／CC0 原始 | 結果與限制 |
| --- | ---: | --- |
| `rainy window` | 0／0 | `rain` 有 David Revoy 兩張現代雨景畫，來源有相近氣氛，原詞未觸及；作品沒呈現室內雨窗。 |
| `shoes at door` | 0／8 | 古典版畫、工藝或舊火車，沒有現代門口情緒畫。 |
| `windy deck` | 0／0 | 無法區分原詞覆蓋與供應缺口。 |
| `peaceful waves` | 0／1 | 只抓到古籍火車，控制 `seascape` 仍為空。 |
| `deck rail` | 0／8 | rail 被解讀為火車，全部為歷史鐵路圖。 |
| `hand gripping rail` | 0／0 | 沒有當代手勢場景，排序無候選。 |
| `ticket in hand` | 18／18 | 現代書籍插圖未畫車票；其餘有獎章、圖譜與舊書。Openverse 是孤立票券剪貼畫。 |
| `ticket in snow` | 0／1 | metadata 指向 1969 年的雪景，圖片未載入，未計入。 |
| `lonely alley lamp` | 0／0 | 雨巷單件可證明類似情境存在，但不足以證明原詞或一般搜尋能找到。 |
| `hand holding friend` | 0／0 | `friends` 有 11 張，主要是資訊圖和歷史插圖，沒找到濕街相聚的現代情緒畫。 |

控制詞只用來區分搜尋失配和已證實的供應，沒有加入正式流程。沒有候選的組別無法從單次索引回應斷言整個資料庫沒有作品。

## 現代插畫來源

- Commons 可逐件核對 David Revoy 的作者、作品及 CC BY 4.0。控制查詢 `rain` 的當代《The After Rain Smell》及《Puddle Jump》證實有合適媒材。單一作者只覆蓋少數主題，不建立歌曲或作者硬編碼。
- Openverse 用相同十組詞，限定 category=illustration、BY/CC0，九組為空；`ticket in hand` 剩兩張標記 CC0 的圖示／剪貼畫，未找到符合故事的現代情緒插畫。索引標記不能代替原始作品授權，條款保留特定用途收費。
- Openclipart 有 CC0 與 beta API 文件入口；實測文件及歷史 JSON 路徑都導向首頁。三個原詞用公開搜尋頁，兩組無結果、一組為手機剪貼畫。尚未驗證可用的正式搜尋 API 或所需素材。
- Pixabay 有免費的 illustration API，需金鑰，條款限制原圖的獨立再散布，API 對長期熱連結也有限制。未取得適用 MuPho 的授權或 API 驗收證據，保持未接入。The Met 不計入當代情緒插畫成功率。

[Commons 現代雨巷插畫](https://commons.wikimedia.org/wiki/File:2023-01-09_The-after-rain-smell_by-David-Revoy.jpg) · [Openverse 條款](https://docs.openverse.org/terms_of_service.html) · [Openclipart 開發者頁](https://openclipart.org/developers) · [Pixabay API](https://pixabay.com/api/docs/) · [Pixabay 條款](https://pixabay.com/service/terms/)

## 採用的兩項修正

1. 攝影優先採用同一句非重複說明中的多個主題詞，保留完整主題標題優勢。相同 85 張候選重算和實網均重現兩個首張改善。插畫保持原排序。
2. Commons 宣告 `CC0` 且 URL 確認為 Creative Commons 的 CC0 1.0（含語系 deed）時，正規化為既有授權欄位。一般 Public domain 字樣、非官方網址及有限制作品仍不通過。使用者仍透過既有分頁取得補充結果。

Prompt V1、UI、供應商、授權白名單及請求數不變。Lint、TypeScript、build、18 項單元／整合、Chromium 32、WebKit 12、雲端流程 fixture 2 均通過。
