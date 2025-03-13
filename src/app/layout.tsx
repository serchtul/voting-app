import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({
  weight: ["300", "400", "700"], // Light, Medium and Bold
  subsets: ["latin"],
  variable: "--font-lato"
})

export const metadata: Metadata = {
  title: "Votaciones AIESEC en Mexico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} mt-4 mx-10`}>
        {children}
      </body>
    </html>
  );
}
