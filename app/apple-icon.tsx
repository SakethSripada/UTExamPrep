import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

const longhornPath =
  "M48 56c26-5 48 6 70 21 18 12 31 20 46 19 8 0 13-3 19-4 4-1 7 1 11 0 4-2 8 1 12 0 4-2 8 1 12 0 4-1 8 1 13 0 6 1 11 4 19 4 15 1 28-7 46-19 22-15 44-26 70-21 5 1 7 4 6 8-1 3-3 4-7 3-20-2-37 3-52 13-20 14-36 23-50 28-3 1-3 3 0 4 8 4 16 4 21 9 4 4-1 9-6 11-8 3-18-1-27-6-2-1-4 0-4 4-1 13-5 25-10 37-4 9-8 18-7 27 1 6-2 8-1 15 1 7-5 11-13 12h-10c-9 0-16-4-18-10-1-5 0-9-2-12-3-5-1-11 2-17 1-8-3-17-7-26-5-11-8-22-9-32 0-3-2-3-5-1-10 6-19 10-27 7-7-2-11-7-7-11 5-5 13-5 21-9 3-1 3-3 0-4-14-5-30-14-50-28-17-12-33-16-53-13-4 1-6 0-8-3-1-4 1-7 6-8Z";

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
        <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
          <path d={longhornPath} transform="translate(2 4) scale(.14)" fill="#fff9f1" />
          <path
            d="M8 43c8-4 16-4 24 1v13c-8-5-16-5-24-1V43Zm48 0c-8-4-16-4-24 1v13c8-5 16-5 24-1V43Z"
            stroke="#fff9f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
