import React from "react";
import type { PageImage } from "./types";

interface CalendarPosterProps {
  pageImages: PageImage[];
  renderPoster?: (imgs: PageImage[]) => React.ReactNode;
}

function CalendarPoster({ pageImages, renderPoster }: CalendarPosterProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {renderPoster
        ? renderPoster(pageImages)
        : pageImages.map((pageImage, i) => {
            // 直接使用 pageImage 的 image
            const imageSrc = pageImage.image;

            return (
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
                  src={imageSrc}
                  alt="page"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            );
          })}
    </div>
  );
}

// 使用 React.memo 避免不必要的重渲染
export default React.memo(CalendarPoster, (prevProps, nextProps) => {
  // 检查图片数组长度是否发生变化
  if (prevProps.pageImages.length !== nextProps.pageImages.length) {
    return false;
  }

  // 检查每个图片的 image 是否发生变化
  return prevProps.pageImages.every((pageImage, index) => {
    const nextPageImage = nextProps.pageImages[index];
    if (!nextPageImage) return false;

    // 比较 image
    return pageImage.image === nextPageImage.image;
  });
});
