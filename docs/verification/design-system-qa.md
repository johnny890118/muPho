# MuPho 設計系統與驗收流程稽核

## 現況與決策

- 倉庫沒有追蹤中的 `AGENTS.md` 或 Claude Code 專屬設定。現有 UI 重構文件記錄歷史需求與實網驗收，保留原文及五張參考圖。新增短版 `AGENTS.md` 作為工作入口，各主題隨任務查閱。依官方 Codex 指引保留長期規則，依可驗證結果選擇檢查。Claude Code 只採用提供具體驗證證據的通用做法。[OpenAI AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) · [OpenAI 指令建議](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra) · [Codex Goals](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex) · [Claude Code 原則](https://code.claude.com/docs/en/best-practices)
- 五張參考圖與現行程式涵蓋首頁、桌機／手機結果和預覽。現行 Tailwind tokens 與 shadcn/ui 元件足以延續炭黑、暖白、柔和琥珀的方向。將規範集中到 [Design System](../design/design-system.md)，正式元件、CSS、產品流程及後端皆沿用原實作。
- 既有 Playwright 主要涵蓋互動及人工擷取的實網畫面。新增首頁視覺比對，使用固定字型與原創 SVG fixture，封閉對外請求。保留既有測試與專案，基準依 macOS 和 viewport 保存。預設比較模式禁止寫入基準。[Playwright 視覺比對](https://playwright.dev/docs/test-snapshots)

## 驗收

以本機 macOS、Playwright 鎖定的 Chromium，比對 1440×900 和 390×844。逐張檢視首次基準中的品牌、示範列、圖片保留區域與裁切，並檢查兩種寬度的橫向溢位、按鈕尺寸、鍵盤焦點與帶入歌名。基準內的山景是測試資料，授權與來源文字仍由正式頁面產生。

| 檢查 | 結果 |
| --- | --- |
| `npm run lint`、`npm run typecheck`、`npm run build` | PASS |
| `npm run test:visual` | PASS，2 個 viewport 的現行畫面符合首次審閱的基準 |
| `npm run test:e2e` | PASS，20 項既有互動與 2 項首頁比對 |
| `npm test`、實網 smoke、其他平台的像素比較 | SKIP。程式變更限測試與文件，本次未驗證其他平台及上游供應 |

[桌機基準](../../tests/snapshots/darwin/desktop-1440/home.visual.spec.ts/home.png) · [手機基準](../../tests/snapshots/darwin/mobile-390/home.visual.spec.ts/home.png) · [重跑與審查差異](../../README.md#ui-驗收)

首頁以外的視覺狀態仍依改動選擇瀏覽器驗收。字型 fixture 只涵蓋現有首頁文字。瀏覽器或作業系統升級時，需檢視 renderer 差異再更新對應基準。
