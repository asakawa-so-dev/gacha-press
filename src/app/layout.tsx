import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import { LikesProvider } from "@/lib/likes-store";
import { PlayedProvider } from "@/lib/played-store";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-serif-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "marupaca｜カプセルトイのキュレーションメディア",
  description:
    "好きに、胸を張れ。カプセルトイと生活の融合。大人のためのガチャキュレーションメディア。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${notoSerifJP.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LikesProvider>
          <PlayedProvider>{children}</PlayedProvider>
        </LikesProvider>
      </body>
    </html>
  );
}
