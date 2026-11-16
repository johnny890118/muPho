import { SearchHero, SearchShell } from "@/components/search-shell";

export default function Home() {
  return (
    <SearchShell>
      <SearchHero><p className="mt-8 text-muted-foreground">搜尋服務尚未啟用。</p></SearchHero>
    </SearchShell>
  );
}
