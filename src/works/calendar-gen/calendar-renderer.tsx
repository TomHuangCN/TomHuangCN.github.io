import React from "react";
import type { CalendarImage } from "./calendar-gen";

interface CalendarRendererProps {
  images: CalendarImage[];
  renderPage?: (img: CalendarImage, idx: number) => React.ReactNode;
}

export default function CalendarRenderer({
  images,
  renderPage,
}: CalendarRendererProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {images.map((img, i) => (
        <div
          key={i}
          style={{
            width: 120,
            height: 160,
            border: "1px solid #eee",
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          {renderPage ? (
            renderPage(img, i)
          ) : (
            <img
              src={img.url}
              alt="page"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
