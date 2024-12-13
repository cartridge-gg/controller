import { Providers } from "@/components/providers";
import { Metadata } from "next";
import { PropsWithChildren } from "react";

import "./globals.css";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Cartridge Controller - Example (Next.js)",
  icons: {
    icon: "favicon.ico",
  },
};
