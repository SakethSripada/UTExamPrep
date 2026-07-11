import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "UTExamPrep | Practice Exams",
  description: "Past and practice exams for UT Austin courses.",
  applicationName: "UTExamPrep",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
  },
  openGraph: {
    title: "UTExamPrep | Practice Exams",
    description: "Past and practice exams for UT Austin courses.",
    siteName: "UTExamPrep",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "UTExamPrep practice exam library" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UTExamPrep | Practice Exams",
    description: "Past and practice exams for UT Austin courses.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
