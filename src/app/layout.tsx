import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../index.css";

const DESCRIPTION =
  "Shreyas works at the Centre for Data Science and AI at the University of Glasgow. Projects, dashboards, a live wildlife simulator and a free course on prompting.";

/**
 * On Vercel, the project's production domain (its custom domain once one is
 * assigned), so the share image and the canonical link are absolute without
 * anyone hard-coding a domain. Locally it is whatever port the dev server is on.
 */
const site = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${process.env.PORT ?? 3000}`;

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "shreyeahhs",
  description: DESCRIPTION,
  authors: [{ name: "Shreyas" }],
  alternates: { canonical: "/" },
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
  openGraph: {
    type: "website",
    title: "shreyeahhs",
    description:
      "Projects, dashboards, a live wildlife simulator and a free course on prompting. Oh, and a lot of Hot Wheels.",
    images: ["/preview.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "shreyeahhs",
    images: ["/preview.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0d" },
  ],
};

/**
 * A visitor who picked a theme gets it on the first frame, not the system's for a
 * moment before React hydrates. Mirrors useTheme() in src/lib/theme.ts. It runs
 * before the body is parsed, which is why <html> suppresses the hydration warning:
 * the attribute it may add is meant to differ from the server's markup.
 */
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        {/* Dialogs make this inert while they are open, and the background map spans it. */}
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
