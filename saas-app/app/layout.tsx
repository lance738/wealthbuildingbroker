import type { ReactNode } from "react";

export const metadata = {
  title: "Wealth Building Broker — Platform",
  description: "The Broker Financial Dashboard and Scorecard by Lance Hulsey.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Inter, system-ui, sans-serif", margin: 0, color: "#1a2332" }}>
        {children}
      </body>
    </html>
  );
}
