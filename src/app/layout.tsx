import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "IPFO SIFPI",
  description: "Sistem Informasi Fasilitasi Proyek Infrastruktur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
        <Toaster position="top-center" style={{ "--width": "480px" } as React.CSSProperties} />
      </body>
    </html>
  );
}
