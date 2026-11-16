import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MuPho｜從一首歌出發",
  description: "從歌曲探索攝影和插畫，收藏喜歡的畫面，帶著作者署名分享。",
  icons: { icon: "/mupho-logo.svg" },
  openGraph: { title: "MuPho｜從一首歌出發", description: "從歌曲探索攝影和插畫。", siteName: "MuPho", locale: "zh_TW", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant" className="dark"><body className="min-h-dvh bg-background text-foreground antialiased">{children}</body></html>;
}
