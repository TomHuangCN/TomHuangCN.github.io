import CalendarDemo from "../../helpers/calendar-demo/calendar-demo";
import { useCallback, useState, useRef, useEffect } from "react";
import type { PageImage } from "../../helpers/calendar-demo/types";
import { CJMHVAR001Poster } from "./cj-mhvar001-poster";

export const CJ_MHVAR001_WIDTH = 2008;
export const CJ_MHVAR001_HEIGHT = 1417;

export default function CJ_MHVAR001() {
  const [isLoading, setIsLoading] = useState(false);
  const canvasRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentPictures, setCurrentPictures] = useState<PageImage[]>([]);

  useEffect(() => {
    if (currentPictures.length === 0) return;

    setIsLoading(true);
    const poster = new CJMHVAR001Poster(currentPictures);

    poster
      .render()
      .then((canvases: HTMLCanvasElement[]) => {
        const container = canvasRefs.current[0];
        if (container) {
          container.innerHTML = "";
          canvases.forEach((canvas: HTMLCanvasElement) => {
            canvas.style.width = "100%";
            container.appendChild(canvas);
          });
        }
        setIsLoading(false);
      })
      .catch((error: unknown) => {
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
      pageWidth={CJ_MHVAR001_WIDTH}
      pageHeight={CJ_MHVAR001_HEIGHT}
      renderPoster={renderPoster}
      storeName="CJ_MHVAR001"
    />
  );
}
