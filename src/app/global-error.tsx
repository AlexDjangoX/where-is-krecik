"use client";

import { Source_Sans_3 as SourceSans3 } from "next/font/google";

const font = SourceSans3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans",
  display: "swap",
});

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

const buttonStyle = {
  marginTop: "1.5rem",
  border: 0,
  borderRadius: 999,
  background: "#3f6212",
  color: "#fff",
  padding: "0.5rem 1rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
} as const;

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en" className={font.variable}>
      <body style={pageStyle}>
        <title>Something went wrong | Where is Krecik?</title>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>
          Something went wrong / Coś poszło nie tak
        </h1>
        {error.digest ? (
          <p
            style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", opacity: 0.6 }}
          >
            {error.digest}
          </p>
        ) : null}
        <button type="button" onClick={() => retry()} style={buttonStyle}>
          Try again / Spróbuj ponownie
        </button>
      </body>
    </html>
  );
}
