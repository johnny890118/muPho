# MuPho 可行性

2026-11-17 從 main 的 6b050b2 盤點，工作樹乾淨。舊版使用 Next.js 14 Pages Router、瀏覽器直接呼叫 Pexels、歌名提示詞推論與固定字串 fallback。基線 lint 成功但有 hooks 與圖片警告，沒有 typecheck 或測試指令。舊首頁的第三方示範照片暫不重用。

Git 歷史曾追蹤 .env，舊首頁也引用瀏覽器公開環境變數。專案擁有人應停用或輪換曾寫入歷史或發到前端的憑證。

GitHub 查詢顯示零 Actions workflows、空 repository webhook 清單、main 未受分支保護，但有多筆 Production 部署。GitHub App 安裝查詢回傳 404，無法核實新分支是否會觸發外部部署。變更保留在本地開發分支。

採用 [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation) 與 [shadcn/ui](https://ui.shadcn.com/docs/installation/next)。對外搜尋預設關閉。可在既有主機上用本機持久 SQLite 檔案和多程序共享額度。SQLite WAL 需同一台機器與本機磁碟。跨主機與雲端部署條件尚未確認。參閱 [SQLite WAL](https://www.sqlite.org/wal.html)。
