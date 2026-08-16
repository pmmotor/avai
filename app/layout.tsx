import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVAI Admin",
  description: "AVAI movie upload administration",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

