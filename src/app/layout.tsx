import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/app-shell/ServiceWorkerRegister";

const APP_NAME = "MONSTIEZ Universe";
const APP_DESCRIPTION =
  "Your little BABYMONSTER corner — discover, follow, track, and celebrate in one place. Unofficial fan-made app for MONSTIEZ. Not affiliated with YG Entertainment.";

export const metadata: Metadata = {
  title: {
    default: "MONSTIEZ Universe — Your BABYMONSTER Corner",
    template: "%s · MONSTIEZ Universe",
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MONSTIEZ Universe",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png" }],
  },
  formatDetection: { telephone: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#F6CDE0",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
