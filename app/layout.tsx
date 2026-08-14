import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Archivo_Black, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const ui = Space_Grotesk({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ui",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Shortly",
  description: "Brutal short links with click analytics",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      appearance={{
        theme: "neobrutalism",
        variables: {
          fontFamily: "var(--font-ui)",
          fontFamilyButtons: "var(--font-ui)",
        },
      }}
    >
      <html
        lang="en"
        className={`${display.variable} ${ui.variable} ${mono.variable} dark h-full`}
      >
        <body className="grid-bg flex min-h-full flex-col bg-[#0b0b0b] text-[#f4efe4]">
          <SiteHeader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
