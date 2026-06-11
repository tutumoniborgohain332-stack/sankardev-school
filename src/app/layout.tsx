import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ssvnm.in";

export const metadata: Metadata = {
  title: {
    default: "Sankardev Sishu Vidya Niketan, Mathurapur",
    template: "%s | SSVN Mathurapur"
  },
  description: "Official website of Sankardev Sishu Vidya Niketan Mathurapur. Fostering excellence in education, culture, and discipline under Shishu Shiksha Samiti, Assam. Recognized as a top educational institution serving Charaideo and Sivasagar districts.",
  keywords: [
    "SSVN Mathurapur", 
    "Sankardev Sishu Vidya Niketan", 
    "Mathurapur School", 
    "Assam School", 
    "Best school in Mathurapur",
    "Best school in Charaideo district",
    "Best high school in Sivasagar",
    "Top school in Sivasagar",
    "Best Assamese medium school in Charaideo",
    "High school in Charaideo",
    "Education in Assam",
    "Shishu Shiksha Samiti"
  ],
  authors: [{ name: "SSVN Mathurapur" }],
  creator: "SSVN Mathurapur",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    title: "Sankardev Sishu Vidya Niketan, Mathurapur",
    description: "Official website of Sankardev Sishu Vidya Niketan Mathurapur. Fostering excellence in education, culture, and discipline.",
    siteName: "SSVN Mathurapur",
    images: [
      {
        url: "/logo-25.png",
        width: 800,
        height: 600,
        alt: "SSVN Mathurapur Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sankardev Sishu Vidya Niketan, Mathurapur",
    description: "Official website of Sankardev Sishu Vidya Niketan Mathurapur.",
    images: ["/logo-25.png"],
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
  other: {
    "geo.region": "IN-AS",
    "geo.placename": "Mathurapur",
    "geo.position": "26.9602;94.8814",
    "ICBM": "26.9602, 94.8814"
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Sankardev Sishu Vidya Niketan, Mathurapur",
  "url": BASE_URL,
  "logo": `${BASE_URL}/logo-25.png`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Mathurapur",
    "addressLocality": "Mathurapur",
    "addressRegion": "Assam",
    "postalCode": "785689",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 26.9602,
    "longitude": 94.8814
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Mathurapur"
    },
    {
      "@type": "City",
      "name": "Charaideo"
    },
    {
      "@type": "City",
      "name": "Sivasagar"
    }
  ],
  "description": "Top-rated educational institution in Mathurapur, serving students across Charaideo and Sivasagar districts with excellence in education, culture, and discipline."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
