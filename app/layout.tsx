import type { Metadata, Viewport } from "next";
import { Noto_Sans_Gujarati } from "next/font/google";
import "./globals.css";

const gujarati = Noto_Sans_Gujarati({
  variable: "--font-gujarati-loaded",
  subsets: ["gujarati"],
  weight: ["600", "700"],
  display: "swap",
});

// Change this the moment a real domain is pointed at the deploy — OG images
// need absolute URLs, and a wrong metadataBase means broken link previews.
const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://garba-wtf.pages.dev";

// Cloudflare Web Analytics: how many people actually visit, distinct from the
// live head count above (which is only ever "right now"). Token comes from
// dash.cloudflare.com → Analytics & Logs → Web Analytics → Add a site → the
// JS snippet is the manual option, needed here because a workers.dev
// subdomain isn't a zone Cloudflare manages DNS for, so the automatic-setup
// dropdown can't see it. No cookies, nothing to consent to.
const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

const TITLE = "Garba Night";
const DESC =
  "The society garba ground, in your browser. Nine nights, nine colours.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  applicationName: TITLE,
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE,
    siteName: TITLE,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
  },
};

export const viewport: Viewport = {
  themeColor: "#05070a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${gujarati.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        {CF_BEACON_TOKEN && (
          <script
            defer
            src="https://static.cloudflare.com/beacon.min.js"
            data-cf-beacon={`{"token": "${CF_BEACON_TOKEN}"}`}
          />
        )}
      </body>
    </html>
  );
}
