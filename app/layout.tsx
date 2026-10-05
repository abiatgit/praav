import type { Metadata } from "next";
import { Rubik, Quicksand, Roboto } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/lib/cart/cart-context";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-nav",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://praav.uk';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pre-loved Indian Ethnic Wear in the UK | praav.uk",
    template: "%s | praav.uk",
  },
  description: "Buy and sell pre-loved Indian ethnic wear across the UK. Discover sarees, lehengas, salwar kameez, sherwanis and more.",
  keywords: ["Indian ethnic wear", "pre-loved sarees", "second hand lehengas", "UK Indian fashion", "ethnic wear marketplace"],
  authors: [{ name: "praav.uk" }],
  creator: "praav.uk",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    title: "Pre-loved Indian Ethnic Wear in the UK | praav.uk",
    description: "Buy and sell pre-loved Indian ethnic wear across the UK. Discover sarees, lehengas, salwar kameez, sherwanis and more.",
    siteName: "praav.uk",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pre-loved Indian Ethnic Wear in the UK | praav.uk",
    description: "Buy and sell pre-loved Indian ethnic wear across the UK. Discover sarees, lehengas, salwar kameez, sherwanis and more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${rubik.variable} ${quicksand.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
