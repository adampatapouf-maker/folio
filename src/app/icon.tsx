import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** App icon (favicon + PWA): the lime "F" mark, full-bleed for maskable use. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #CCFF00 0%, #9FE000 100%)",
          color: "#0D1117",
          fontSize: 300,
          fontWeight: 800,
          fontFamily: "serif",
        }}
      >
        F
      </div>
    ),
    size
  );
}
