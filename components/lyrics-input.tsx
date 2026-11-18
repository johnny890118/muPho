import { useEffect, useRef, useState } from "react";
import { directionsSchema, type Directions } from "@/lib/ai-lyrics";
import type { VisualIntent } from "@/lib/song-intents";
import { deriveLyricsIntent, lyricsMaxLength } from "@/lib/lyrics-intent";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export function LyricsInput({ pending, active, onApply, onCloud, onReset }: {
  pending: boolean; active: boolean; onApply: (intent: VisualIntent) => void; onReset: () => void; onCloud?: (directions: Directions) => void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [lyrics, setLyrics] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [open, setOpen] = useState(Boolean(onCloud));
  const [message, setMessage] = useState("");

  const activeRequest = useRef<AbortController | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  useEffect(() => () => activeRequest.current?.abort(), []);

  async function runCloud() {
    if (!onCloud || activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setAnalyzing(true);
    setMessage("AI 正在分析歌詞…");
    try {
      const reply = await fetch("/api/lyrics", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics, authorized }), signal: controller.signal,
      });
      if (reply.status === 429) {
        setMessage("AI 分析額度暫時用完，請稍後再試。");
        return;
      }
      if (!reply.ok) throw new Error();
      const { directions } = await reply.json();
      const checked = directionsSchema.parse(directions);
      controller.signal.throwIfAborted();
      closeForm();
      onCloud(checked);
    } catch {
      if (!controller.signal.aborted) setMessage("AI 暫時無法分析歌詞，請稍後再試。");
    } finally {
      activeRequest.current = null;
      if (!controller.signal.aborted) setAnalyzing(false);
    }
  }

  function closeForm() {
    setLyrics("");
    setAuthorized(false);
    setMessage("");
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  return (
    <div className="mb-3 px-1.5 sm:px-0">
      <Button ref={trigger} type="button" variant="ghost" className="min-h-11 px-2 text-primary" aria-expanded={open} disabled={analyzing}
        onClick={() => { setOpen(!open); setLyrics(""); setAuthorized(false); setMessage(""); }}>
        提供歌詞
      </Button>
      {active && <Button disabled={analyzing} type="button" variant="ghost" className="min-h-11 px-2 text-muted-foreground" onClick={() => { closeForm(); onReset(); }}>{onCloud ? "清除歌詞結果" : "回到歌曲資料推薦"}</Button>}
      {open && <form className="max-w-xl space-y-3 rounded-md bg-card p-3" onSubmit={(event) => {
        event.preventDefault();
        if (!authorized || pending || analyzing) return;
        if (onCloud) { void runCloud(); return; }
        const intent = deriveLyricsIntent(lyrics);
        if (!intent) {
          setMessage("找不到可轉成圖片搜尋的意象，可改用歌曲資料或微調關鍵字。");
          return;
        }
        closeForm();
        onApply(intent);
      }}>
        <p id="lyrics-privacy" className="text-sm text-muted-foreground">{onCloud ? "請只貼上你有權交由 GroqCloud 處理的完整歌詞。送出後，全文會傳給 GroqCloud 分析。MuPho 不保存原文，圖片來源只收到簡短搜尋詞。" : "請只貼上你有權提供與處理的歌詞。原文留在瀏覽器，圖片搜尋只會使用從固定詞庫找出的意象。"}</p>
        <Textarea aria-label="你提供的歌詞" aria-describedby="lyrics-privacy" rows={4} required disabled={analyzing} maxLength={lyricsMaxLength}
          autoComplete="off" spellCheck={false} value={lyrics} onChange={(event) => { setLyrics(event.target.value); setMessage(""); }} />
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" required disabled={analyzing} checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} className="size-4 accent-primary" />
          {onCloud ? "我有權處理這些歌詞，並同意傳給 GroqCloud" : "我有權提供並處理這些歌詞"}
        </label>
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
        <Button type="submit" className="min-h-11" disabled={!authorized || !lyrics.trim() || pending || analyzing}>{onCloud ? "用 AI 找圖" : "用歌詞找圖"}</Button>
      </form>}
    </div>
  );
}
