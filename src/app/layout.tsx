import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "../components/LayoutWrapper";
import { SettingsProvider } from "../contexts/SettingsContext";
import { FileDetailsProvider } from "../contexts/FileDetailsContext";
import { FileListProvider } from "../contexts/FileListContext";
import { SearchProvider } from "../contexts/SearchContext";
import { FilePreviewProvider } from "../contexts/FilePreviewContext";
import { TagProvider } from "../contexts/TagContext";
import { FileTagsProvider } from "../contexts/FileTagsContext";
import { ClipProvider } from "../contexts/ClipContext";
import { UploadProvider } from "../contexts/UploadContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      { url: '/favicon.webp', sizes: '32x32', type: 'image/webp' },
      { url: '/favicon.webp', sizes: '16x16', type: 'image/webp' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.webp',
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
        className={`${poppins.variable} ${geistMono.variable} antialiased`}
      >
        <SettingsProvider>
          <TagProvider>
            <FileTagsProvider>
              <ClipProvider>
                <UploadProvider>
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
                </UploadProvider>
              </ClipProvider>
            </FileTagsProvider>
          </TagProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
