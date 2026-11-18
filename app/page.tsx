import { groqKey } from "@/lib/providers/groq";
import { blockedCommonsIds } from "@/lib/commons-policy";
import { Explorer } from "@/components/explorer";

export const dynamic = "force-dynamic";

export default function Home() {
  const report = URL.parse(process.env.MUPHO_REPORT_URL ?? "");
  const reportUrl = report?.protocol === "https:" && !report.username && !report.password ? report.href : undefined;
  return <Explorer reportUrl={reportUrl} blockedIds={blockedCommonsIds()} cloudLyrics={Boolean(groqKey())} />;
}
