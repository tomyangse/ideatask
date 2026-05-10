import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exobrain — Your Cognitive Universe",
  description: "AI-native idea & project management platform. Turn fleeting thoughts into actionable projects in a cosmic 3D workspace.",
  keywords: ["AI", "idea management", "project management", "brainstorming", "productivity"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
