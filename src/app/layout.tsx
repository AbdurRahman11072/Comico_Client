import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Genz Toon — Read Manga, Manhwa & Comics Online",
  description:
    "A standard scanlation site dedicated to providing high-quality translations. Enjoy a vast library of manga, manhwa and comic series, updated regularly.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${bebasNeue.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
