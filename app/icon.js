import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          background: "#2563eb",
          borderRadius: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            fill="#fff"
            d="M11 3h2v6h6v2h-6v6h-2v-6H5V9h6V3Z"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
