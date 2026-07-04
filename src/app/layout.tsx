import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secure Peer Support Network",
  description: "Connect with verified peer supporters while maintaining privacy through zero-knowledge proofs and end-to-end encryption.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
