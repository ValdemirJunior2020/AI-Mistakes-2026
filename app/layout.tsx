// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HotelPlanner AI QA Dashboard",
  description: "Executive AI QA mistake dashboard for HotelPlanner management"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // IMPORTANT: no dark class here
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}