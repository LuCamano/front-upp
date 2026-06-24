import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans } from "next/font/google";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gestión de prácticas",
  description: "Plataforma de Gestión de Prácticas Pedagógicas de la Facultad de Educación.",
  metadataBase: new URL("https://tu-dominio-o-app.vercel.app"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Gestión de prácticas",
    description: "Gestión de Prácticas Pedagógicas",
    type: "website",
    locale: "es_CL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${ptSans.variable} font-body antialiased bg-background text-foreground min-h-screen`}
      >
        <main className="min-h-screen">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
