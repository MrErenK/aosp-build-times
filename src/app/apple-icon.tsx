import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const UNIT = size.width / 16;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: size.width,
          height: size.height,
          background: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            border: `${UNIT}px solid #000000`,
          }}
        />
        <div
          style={{
            display: "flex",
            color: "#000000",
            fontFamily: "monospace",
            fontSize: 128,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          A
        </div>
      </div>
    ),
    size,
  );
}
