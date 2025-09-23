import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import ImageComponent from "next/image";
import logo from "@/public/Nutrient_Logo.png";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

const NEXT_PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;
const FAVICON_VERSION = process.env.NEXT_PUBLIC_DEPLOY_TIME || new Date().getTime();

export const metadata = {
  title: "Sign App",
  description: "PSPDFKIt Signing Demo Sample Application",
  metadataBase: `http://localhost:${process.env.PORT || 3000}`,
  ink: {
    rel: "icon",
    href: `${NEXT_PUBLIC_BASE_PATH}/favicon.ico?v=${FAVICON_VERSION}`,
    type: "image/x-icon",
  },
  // link: {
  //   rel: "icon",
  //   href: NEXT_PUBLIC_BASE_PATH + "/favicon-32x32.png?" + new Date().getTime(),
  //   sizes: "32x32",
  //   type: "image/png",
  // },
  // link: {
  //   rel: "icon",
  //   href: NEXT_PUBLIC_BASE_PATH + "/android-chrome-192x192.png",
  //   sizes: "192x192",
  //   type: "image/png",
  // },
  // link: {
  //   rel: "icon",
  //   href: NEXT_PUBLIC_BASE_PATH + "/android-chrome-512x512.png",
  //   sizes: "512x512",
  //   type: "image/png",
  // },
  openGraph: {
    title: "Sign App",
    description: "PSPDFKIt Sign App",
    url: "",
    images: [
      {
        url: "",
        width: 800,
        height: 600,
      },
    ],
  },
};

const SFProText = localFont({
  src: [
    {
      path: "../fonts/SFProText-Light.ttf",
      weight: "300",
    },
    {
      path: "../fonts/SFProText-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SFProText-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/SFProText-Semibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/SFProText-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sfprotext",
});

const SFProDisplay = localFont({
  src: [
    {
      path: "../fonts/SFDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-sfprodisplay",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.cloud.pspdfkit.com/pspdfkit-web@1.5.0/nutrient-viewer.js"
          // Load before the page becomes interactive to reference window.NutrientViewer in the client
          strategy="beforeInteractive"
        />
      </head>
      <body
      className={SFProText.variable+" "+SFProDisplay.variable}
      >
        <nav style={{ display: "flex", alignItems: "center", margin: "10px" }}>
          <ImageComponent
            src={logo}
            width={150}
            className="inline-block"
            alt="plus icon"
          />
          <span
            style={{
              fontSize: "25px",
              fontWeight: "500",
              margin: "15px 10px",
              color: "black",
            }}
          >
           Sign App
          </span>
        </nav>
        {children}
      </body>
    </html>
  );
}
