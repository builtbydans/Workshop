import type { Metadata } from "next";
import { Barlow_Condensed, Source_Sans_3 } from "next/font/google";

import "../garage/garage.css";

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
  title: "Customer Simulation · Northside Motor Co.",
  description:
    "Staff-only simulation of the Northside Motor Co. customer quotation experience.",
};

export default function DemoCustomerLayout({
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
