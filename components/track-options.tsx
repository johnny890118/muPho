import type { Track } from "@/lib/search-types";
import { ChevronRight, Music2 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

export function TrackOptions({ tracks, onSelect, onClose, restoreFocus }: {
  tracks: Track[]; onSelect: (track: Track) => void; onClose: () => void; restoreFocus: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[85dvh] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden border-border sm:max-w-xl"
        onCloseAutoFocus={(event) => { event.preventDefault(); restoreFocus(); }}>
        <DialogTitle className="font-display text-2xl">選擇歌曲版本</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">確認藝人與錄音版本後，開始找圖。</DialogDescription>
        <ul className="min-h-0 overflow-y-auto pr-1">
          {tracks.map((track) => (
            <li key={track.id} className="border-b border-border last:border-b-0">
              <Button variant="ghost" className="h-auto min-h-15 w-full justify-start gap-3 px-2 py-2 text-left whitespace-normal" onClick={() => onSelect(track)}>
                <Music2 aria-hidden="true" className="text-primary" />
                <span className="min-w-0 flex-1 break-words">
                  <span className="block">{track.title} — {track.artist}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{[track.album, track.version, track.milliseconds && formatDuration(track.milliseconds)].filter(Boolean).join(" · ")}</span>
                </span>
                <ChevronRight aria-hidden="true" className="text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function formatDuration(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
