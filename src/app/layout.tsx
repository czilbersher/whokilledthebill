import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/app/components/Nav";
import Script from "next/script";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Who Killed the Bill? | U.S. Legislative Accountability",
  description:
    "Tracking U.S. federal legislation introduced by elected officials — then abandoned in committee without a hearing, vote, or explanation.",
  openGraph: {
    title: "Who Killed the Bill?",
    description:
      "9,799 bills died in committee in the 119th Congress. No hearing. No vote. No accountability.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="min-h-full bg-[#f8f8f6] antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-J6MPM74Z8L"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-J6MPM74Z8L');
          `}
        </Script>
        <Nav />
        {children}
      </body>
    </html>
  );
}