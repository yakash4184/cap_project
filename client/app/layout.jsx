import { Fraunces, Space_Grotesk } from "next/font/google";

import "@/app/globals.css";
import { SiteHeader } from "@/components/site-header";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "Civic Lens",
  description:
    "Modern civic issue reporting and management system for citizens and municipal teams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable} font-sans text-ink`}>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}

