import { ReactNode } from "react";
import {
  Metadata,
  // Viewport
} from "next";

import "./globals.css";
import { Providers } from "components/providers";

export const metadata: Metadata = {
  title: "Cartridge Controller",
  description: "Cartridge Controller Example",
};

// export const viewport: Viewport = {
//   width: "device-width",
//   initialScale: 1,
//   maximumScale: 1,
//   userScalable: false,
//   interactiveWidget: "resizes-content",
// };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
