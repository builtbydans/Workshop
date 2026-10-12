import type { Metadata } from "next";
import { Barlow_Condensed, Source_Sans_3 } from "next/font/google";

import "./garage.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-garage-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-garage-body",
});

export const metadata: Metadata = {
  title: "Northside Motor Co. · Independent Garage",
  description:
    "Independent automotive garage in Manchester. Servicing, MOT, diagnostics and repairs. Request a quotation online.",
};

export default function DemoGarageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${display.variable} ${body.variable} garage-site min-h-svh`}
    >
      {children}
    </div>
  );
}
