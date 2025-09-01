import CalendarDemo from "../../helpers/calendar-demo/calendar-demo";
import { useCallback, useState, useRef, useEffect } from "react";
import type { PageImage } from "../../helpers/calendar-demo/types";
import { CJMVTTP001Poster } from "./cj-mvttp001-poster";

export const CJ_MVTTP001_WIDTH = 1838;
export const CJ_MVTTP001_HEIGHT = 2547;

export default function CJ_MVTTP001() {
  const [isLoading, setIsLoading] = useState(false);
  const canvasRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentPictures, setCurrentPictures] = useState<PageImage[]>([]);

  // 当图片变化时渲染样机
  useEffect(() => {
    if (currentPictures.length === 0) return;

    setIsLoading(true);
    const poster = new CJMVTTP001Poster(currentPictures);

    poster
      .render()
      .then(canvases => {
        const container = canvasRefs.current[0];
        if (container) {
          container.innerHTML = "";
          canvases.forEach(canvas => {
            canvas.style.width = "100%";
            container.appendChild(canvas);
          });
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("渲染失败:", error);
        setIsLoading(false);
      });
  }, [currentPictures]);

  const renderPoster = useCallback(
    (imgs: PageImage[]) => {
      if (!imgs || imgs.length === 0) {
        return (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div>请先选择图片</div>
          </div>
        );
      }

      // 使用 setTimeout 延迟状态更新，避免在渲染过程中调用 setState
      setTimeout(() => {
        setCurrentPictures(imgs);
      }, 0);

      return (
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", width: "100%" }}
        >
          {isLoading && <div>正在渲染...</div>}
          <div
            ref={el => {
              canvasRefs.current[0] = el;
            }}
            style={{
              border: "1px solid #eee",
              borderRadius: 4,
              minHeight: 200,
            }}
          />
        </div>
      );
    },
    [isLoading]
  );

  return (
    <CalendarDemo
      maxPages={13}
      pageWidth={CJ_MVTTP001_WIDTH}
      pageHeight={CJ_MVTTP001_HEIGHT}
      renderPoster={renderPoster}
      storeName="CJ_MVTTP001"
    />
  );
}
