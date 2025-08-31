import React from "react";
import type { CalendarPicture } from "./calendar-demo";

interface CalendarPosterProps {
  pictures: CalendarPicture[];
  renderPoster?: (imgs: CalendarPicture[]) => React.ReactNode;
}

function CalendarPoster({ pictures, renderPoster }: CalendarPosterProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {renderPoster
        ? renderPoster(pictures)
        : pictures.map((img, i) => (
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
              <img
                src={img.url}
                alt="page"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ))}
    </div>
  );
}

// 使用 React.memo 避免不必要的重渲染
export default React.memo(CalendarPoster, (prevProps, nextProps) => {
  // 检查图片数组长度是否发生变化
  if (prevProps.pictures.length !== nextProps.pictures.length) {
    return false;
  }

  // 检查每个图片的 URL 是否发生变化
  return prevProps.pictures.every(
    (img, index) => img.url === nextProps.pictures[index]?.url
  );
});
