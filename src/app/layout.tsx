import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { InterestProvider } from "@/components/InterestProvider";

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-zen",
});

export const metadata: Metadata = {
  title: "カプる。 - ガチャ発売カレンダー",
  description:
    "カプる。は最新のガチャガチャの発売情報をお届けするガチャ活メディアです。発売予定カレンダー、ランキング、気になるリストでガチャ活を楽しもう。",
  openGraph: {
    title: "カプる。 - ガチャ発売カレンダー",
    description:
      "カプる。は最新のガチャガチャの発売情報をお届けするガチャ活メディアです。",
    images: ["/images/ogp.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "カプる。 - ガチャ発売カレンダー",
    description:
      "カプる。は最新のガチャガチャの発売情報をお届けするガチャ活メディアです。",
    images: ["/images/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={zenMaruGothic.variable}>
      <body className="font-zen min-h-screen flex flex-col">
        <InterestProvider>
          <Header />
          <main className="flex-1 pt-14">{children}</main>
          <Footer />
          <BottomNav />
        </InterestProvider>
      </body>
    </html>
  );
}
