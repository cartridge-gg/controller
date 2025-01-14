import { ReactNode } from "react";
import { Metadata } from "next";

import "./globals.css";
import { Providers } from "components/providers";

export const metadata: Metadata = {
  title: "Cartridge Controller",
  description: "Cartridge Controller Example",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
