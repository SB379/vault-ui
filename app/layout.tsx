import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Geist_Mono, Fraunces } from "next/font/google";
import { NavLinks } from "@/components/nav-links";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "Vault — AI Research Signal", template: "%s · Vault" },
  description: "A graph over the arXiv research vault: papers, the concepts they connect, and the daily signal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
              <Link href="/" className="group flex items-baseline gap-2">
                <span className="font-display text-xl italic tracking-tight text-foreground">Vault</span>
                <span className="hidden font-mono text-[10px] tracking-[0.22em] uppercase text-primary/80 sm:inline">
                  research signal
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <NavLinks />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          <footer className="border-t border-border py-6">
            <p className="mx-auto max-w-6xl px-4 font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground sm:px-6">
              vault-ui · reads the vault-core graph API live
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
