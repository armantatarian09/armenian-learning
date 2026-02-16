import type { Metadata } from "next";
import { TopNav } from "@/components/top-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArmenianLingo",
  description: "Duolingo-style Armenian learner web app"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <TopNav />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
