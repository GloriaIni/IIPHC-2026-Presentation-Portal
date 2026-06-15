import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IIPHC2026 Presentation Flyer Generator",
  description: "Generate your I Will Be Presenting flyer for IIPHC2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
