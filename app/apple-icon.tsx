import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#b94f00",
          borderRadius: 36,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#fff9f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 7v14" />
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
          <path d="M5 9c2.3 1.9 4.3 1.8 5.2 3.1L12 15l1.8-2.9c.9-1.3 2.9-1.2 5.2-3.1-.7 2.3-2.2 3.7-4.1 4.4L14.2 17H9.8l-.7-3.6C7.2 12.7 5.7 11.3 5 9Z" fill="#fff9f1" stroke="none" />
        </svg>
      </div>
    ),
    size,
  );
}
