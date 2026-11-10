import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0d1635",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Mencegah zoom saat tap input di HP
  userScalable: false,
};

export const metadata: Metadata = {
  title: "bluDashboard Pro - Keuangan",
  description: "Kelola keuangan ala blu by BCA",
  manifest: "/manifest.json", // Link ke manifest
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "bluPro",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}