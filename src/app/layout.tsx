import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { InterestProvider } from "@/components/InterestProvider";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-zen",
});

const trendSansOne = localFont({
  src: "../fonts/TrendSansOne.otf",
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "marupaca",
  description:
    "marupaca（まるぱか）は最新のガチャガチャの発売情報をお届けするガチャ活メディアです。発売予定カレンダー、ランキング、気になるリストでガチャ活を楽しもう。",
  icons: {
    icon: [{ url: "/images/logo.svg", type: "image/svg+xml" }],
    apple: "/images/logo.svg",
  },
  openGraph: {
    title: "marupaca",
    description:
      "marupaca（まるぱか）は最新のガチャガチャの発売情報をお届けするガチャ活メディアです。",
    images: ["/images/ogp.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "marupaca",
    description:
      "marupaca（まるぱか）は最新のガチャガチャの発売情報をお届けするガチャ活メディアです。",
    images: ["/images/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${trendSansOne.variable}`}>
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
