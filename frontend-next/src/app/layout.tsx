import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ['400', '700', '800'],
  variable: '--font-montserrat'
});

export const metadata: Metadata = {
  title: "Hisab Cal - Expense Tracker",
  description: "Track expenses and settlements between friends with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.variable}>
        {children}
      </body>
    </html>
  );
}
