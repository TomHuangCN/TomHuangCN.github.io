import React from "react";
import type { CalendarImage } from "./calendar-gen";

interface CalendarRendererProps {
  images: CalendarImage[];
  renderPage?: (imgs: CalendarImage[]) => React.ReactNode;
}

function CalendarRenderer({
  images,
  renderPage,
}: CalendarRendererProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {renderPage
        ? renderPage(images)
        : images.map((img, i) => (
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
export default React.memo(CalendarRenderer, (prevProps, nextProps) => {
  // 只有当图片数组真正发生变化时才重新渲染
  if (prevProps.images.length !== nextProps.images.length) {
    return false;
  }
  
  // 检查每个图片的 URL 是否发生变化
  return prevProps.images.every((img, index) => 
    img.url === nextProps.images[index]?.url
  );
});
