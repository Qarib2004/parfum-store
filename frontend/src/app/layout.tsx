import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import {Toaster} from 'sonner'
import { siteConfig } from "@/config/site.config";

import { SocketProvider } from '@/providers/SocketProvider';
import { QueryProvider } from "@/providers/QueryProvider";



const inter = Inter({ subsets: ['latin', 'cyrillic'] });


export  const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <QueryProvider>
          <SocketProvider>
        {children}
        <Toaster richColors position="top-right" />
        </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
