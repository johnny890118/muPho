import type { FormEvent } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export function SearchForm({ mode, input, onMode, onInput, onSubmit, compact }: {
  mode: string; input: string; onMode: (mode: string) => void; onInput: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void; compact: boolean;
}) {
  return (
    <form onSubmit={onSubmit} role="search" className={cn("flex min-w-0", compact
      ? "flex-col gap-1 md:flex-row md:items-center md:gap-4"
      : "mt-5 max-w-xl flex-col gap-4")}>
      <Tabs value={mode} onValueChange={onMode} className={compact ? "order-2 md:flex-none" : ""}>
        <TabsList aria-label="搜尋模式" className={cn("h-auto gap-0 p-0", compact
          ? "grid w-full grid-cols-2 bg-transparent md:flex md:rounded-full md:bg-secondary"
          : "rounded-none border-b border-border bg-transparent")}>
          {["歌曲找圖", "圖片搜尋"].map((label, index) =>
            <TabsTrigger value={index === 0 ? "song" : "image"} key={label} className={cn(
              "min-h-11 rounded-none border-0 border-b-2 border-transparent px-5 font-medium shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-primary",
              compact && "md:rounded-full md:border-b-0 md:px-4 md:dark:data-[state=active]:bg-primary md:dark:data-[state=active]:text-primary-foreground"
            )}>{label}</TabsTrigger>
          )}
        </TabsList>
      </Tabs>
      <div className={cn("flex min-h-12 min-w-0 items-center rounded-xl border border-input/75 bg-secondary/90 pl-3 pr-1 focus-within:border-primary/70", compact && "order-1 flex-1 rounded-full")}>
        <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <Input type="text" name="q" aria-label={mode === "song" ? "歌名" : "圖片關鍵字"} value={input}
          onChange={(event) => onInput(event.target.value)} maxLength={100} required autoComplete="off"
          placeholder={mode === "song" ? "輸入歌名，或加上歌手" : "輸入場景、光線或物件"}
          className="min-w-0 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 dark:bg-transparent" />
        {input && compact && <Button type="button" variant="ghost" aria-label="清除搜尋文字" className="size-11 shrink-0 rounded-full" onClick={() => onInput("")}><X /></Button>}
        <Button type="submit" aria-label="搜尋" className={cn("size-11 shrink-0", compact ? "rounded-full" : "rounded-lg")}><ArrowRight /></Button>
      </div>
    </form>
  );
}
