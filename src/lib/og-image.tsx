import { ImageResponse } from "next/og";

type OgCopy = {
  title: string;
  description: string;
};

export function createOgImage({ title, description }: OgCopy) {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "72px",
        background: "linear-gradient(180deg, #bef264 0%, #84cc16 100%)",
        color: "#1a2e05",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 32,
          maxWidth: 900,
          lineHeight: 1.35,
        }}
      >
        {description}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
