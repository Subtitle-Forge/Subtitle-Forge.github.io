import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "SubtitleForge - SRT File Generator & Video Subtitle Tool",
  description:
    "Create, edit, and embed SRT subtitle files with an intuitive editor. Convert between formats (SRT, VTT, ASS) and burn subtitles into videos directly in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white font-sans"
      >
        <ThemeProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
