import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { InterestProvider } from "@/components/InterestProvider";

const mplusRounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-zen",
});

export const metadata: Metadata = {
  title: "marupaka - ガチャ発売カレンダー",
  description:
    "marupaka（まるぱか）は最新のガチャガチャの発売情報をお届けするガチャ活メディアです。発売予定カレンダー、ランキング、気になるリストでガチャ活を楽しもう。",
  openGraph: {
    title: "marupaka - ガチャ発売カレンダー",
    description:
      "marupaka（まるぱか）は最新のガチャガチャの発売情報をお届けするガチャ活メディアです。",
    images: ["/images/ogp.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "marupaka - ガチャ発売カレンダー",
    description:
      "marupaka（まるぱか）は最新のガチャガチャの発売情報をお届けするガチャ活メディアです。",
    images: ["/images/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={mplusRounded.variable}>
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
