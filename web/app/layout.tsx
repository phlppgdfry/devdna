import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "DevDNA — Your code tells a story",
  description:
    "Discover your developer traits, explore your GitHub patterns, and share your coding DNA.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
