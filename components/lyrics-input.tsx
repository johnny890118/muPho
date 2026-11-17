import { useRef, useState } from "react";
import type { VisualIntent } from "@/lib/song-intents";
import { deriveLyricsIntent, lyricsMaxLength } from "@/lib/lyrics-intent";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export function LyricsInput({ pending, active, onApply, onReset }: {
  pending: boolean; active: boolean; onApply: (intent: VisualIntent) => void; onReset: () => void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [lyrics, setLyrics] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  function closeForm() {
    setLyrics("");
    setAuthorized(false);
    setMessage("");
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  return (
    <div className="mb-3 px-1.5 sm:px-0">
      <Button ref={trigger} type="button" variant="ghost" className="min-h-11 px-2 text-primary" aria-expanded={open}
        onClick={() => { setOpen(!open); setLyrics(""); setAuthorized(false); setMessage(""); }}>
        提供歌詞
      </Button>
      {active && <Button type="button" variant="ghost" className="min-h-11 px-2 text-muted-foreground" onClick={() => { closeForm(); onReset(); }}>回到歌曲資料推薦</Button>}
      {open && <form className="max-w-xl space-y-3 rounded-md bg-card p-3" onSubmit={(event) => {
        event.preventDefault();
        if (!authorized || pending) return;
        const intent = deriveLyricsIntent(lyrics);
        if (!intent) {
          setMessage("找不到可轉成圖片搜尋的意象，可改用歌曲資料或微調關鍵字。");
          return;
        }
        closeForm();
        onApply(intent);
      }}>
        <p id="lyrics-privacy" className="text-sm text-muted-foreground">請只貼上你有權提供與處理的歌詞。原文留在瀏覽器，圖片搜尋只會使用從固定詞庫找出的意象。</p>
        <Textarea aria-label="你提供的歌詞" aria-describedby="lyrics-privacy" rows={4} required maxLength={lyricsMaxLength}
          autoComplete="off" spellCheck={false} value={lyrics} onChange={(event) => { setLyrics(event.target.value); setMessage(""); }} />
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" required checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} className="size-4 accent-primary" />
          我有權提供並處理這些歌詞
        </label>
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
        <Button type="submit" className="min-h-11" disabled={!authorized || !lyrics.trim() || pending}>用歌詞找圖</Button>
      </form>}
    </div>
  );
}
