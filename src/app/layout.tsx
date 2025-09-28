import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "../components/LayoutWrapper";
import { SettingsProvider } from "../contexts/SettingsContext";
import { FileDetailsProvider } from "../contexts/FileDetailsContext";
import { FileListProvider } from "../contexts/FileListContext";
import { SearchProvider } from "../contexts/SearchContext";
import { FilePreviewProvider } from "../contexts/FilePreviewContext";
import { TagProvider } from "../contexts/TagContext";
import { FileTagsProvider } from "../contexts/FileTagsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocFinder",
  description: "Document finder application",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SettingsProvider>
          <TagProvider>
            <FileTagsProvider>
              <FileDetailsProvider>
                <FileListProvider>
                  <FilePreviewProvider>
                    <SearchProvider>
                      <LayoutWrapper>
                        {children}
                      </LayoutWrapper>
                    </SearchProvider>
                  </FilePreviewProvider>
                </FileListProvider>
              </FileDetailsProvider>
            </FileTagsProvider>
          </TagProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
