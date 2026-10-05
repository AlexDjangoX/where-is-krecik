import type { Metadata } from "next";
import { Source_Sans_3 as SourceSans3 } from "next/font/google";

const font = SourceSans3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Page not found | Where is Krecik?",
  description: "That path isn't in Krecik's garden.",
};

const pageStyle = {
  margin: 0,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 1.5rem",
  textAlign: "center",
  background: "#ecfccb",
  color: "#1a2e05",
  fontFamily: "var(--font-source-sans), ui-sans-serif, system-ui, sans-serif",
} as const;

export default function GlobalNotFound() {
  return (
    <html lang="en" className={font.variable}>
      <body style={pageStyle}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>
          We can&apos;t find that page / Nie ma takiej strony
        </h1>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", opacity: 0.7 }}>
          That path isn&apos;t in Krecik&apos;s garden.
        </p>
        <a
          href="/"
          style={{
            marginTop: "1.5rem",
            borderRadius: 999,
            background: "#3f6212",
            color: "#fff",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to the garden / Wróć do ogrodu
        </a>
      </body>
    </html>
  );
}
