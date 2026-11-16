import { Explorer } from "@/components/explorer";
import { SearchShell } from "@/components/search-shell";

export const dynamic = "force-dynamic";

export default function Home() {
  const report = URL.parse(process.env.MUPHO_REPORT_URL ?? "");
  const reportUrl = report?.protocol === "https:" && !report.username && !report.password ? report.href : undefined;
  return <SearchShell><Explorer reportUrl={reportUrl} /></SearchShell>;
}
