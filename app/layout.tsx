import type { Metadata } from "next";
import { MonitorX } from "lucide-react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChamberCript for Lawyers",
  description: "Legal case management software designed for law firms to streamline operations, manage cases, and enhance productivity.",
  icons: {
    icon: '/icon.png', // Path to your logo in the public folder
    // You can also add shortcuts or apple-touch-icons here:
    // shortcut: '/shortcut-icon.png',
    // apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50">
        
        {/* --- Mobile & Tablet Warning Screen --- */}
        {/* Visible on small/medium screens, hidden on large screens (lg:hidden) */}
        <div className="flex lg:hidden flex-col h-screen w-screen items-center justify-center bg-slate-900 text-white p-6 text-center z-50 fixed inset-0">
          <MonitorX className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-3xl font-bold font-serif mb-3"> Chambercript is Not Supported to this Device</h1>
          <p className="text-slate-400 max-w-md">
            Chambercript legal management system is designed exclusively for desktop environments. It does not support mobile phones or tablet devices. 
            <br/><br/>
            Please access this application from a laptop or desktop computer.
          </p>
        </div>

        {/* --- Main Application --- */}
        {/* Hidden on small/medium screens, visible on large screens (hidden lg:flex) */}
        {/* Retains your original flex flex-col setup for the main app */}
        <div className="hidden lg:flex flex-col min-h-full w-full">
          {children}
        </div>

      </body>
    </html>
  );
}