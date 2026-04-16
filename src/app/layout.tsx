import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import localFont from "next/font/local";
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

const trendSansOne = localFont({
  src: "../fonts/TrendSansOne.otf",
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "marupaca",
  description:
    "好きに、胸を張れ。カプセルトイと生活の融合。marupacaは選球眼で選んだカプセルトイだけをキュレーションするメディアです。",
  icons: {
    icon: [{ url: "/images/logo.svg", type: "image/svg+xml" }],
    apple: "/images/logo.svg",
  },
  openGraph: {
    title: "marupaca",
    description:
      "好きに、胸を張れ。カプセルトイのキュレーションメディア marupaca。",
    images: ["/images/ogp.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "marupaca",
    description:
      "好きに、胸を張れ。カプセルトイのキュレーションメディア marupaca。",
    images: ["/images/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${mplusRounded.variable} ${trendSansOne.variable}`}>
      <body className="font-zen min-h-screen flex flex-col">
        <div className="mesh-bg" aria-hidden="true">
          <div className="mesh-orb-1" />
          <div className="mesh-orb-2" />
          <div className="mesh-orb-3" />
          <div className="mesh-orb-4" />
          <div className="mesh-orb-5" />
        </div>
        <InterestProvider>
          <Header />
          <main className="flex-1 pt-20">{children}</main>
          <Footer />
          <BottomNav />
        </InterestProvider>
      </body>
    </html>
  );
}
