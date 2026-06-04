import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Who Killed the Bill? | U.S. Legislative Accountability",
  description:
    "Tracking U.S. federal legislation introduced by elected officials — then abandoned in committee without a vote, a hearing, or an explanation.",
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
      <body className="min-h-full bg-[#f8f8f6] antialiased">{children}</body>
    </html>
  );
}
