import CalendarDemo from "../../helpers/calendar-demo/calendar-demo";
import { useCallback, useState, useRef, useEffect } from "react";
import type { CalendarPicture } from "../../helpers/calendar-demo/calendar-demo";
import { CJMVTTP002Poster } from "./cj-mvttp002-poster";

export const CJ_MVTTP002_WIDTH = 1713;
export const CJ_MVTTP002_HEIGHT = 2540;

export default function CJ_MVTTP002() {
  const [isLoading, setIsLoading] = useState(false);
  const canvasRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentPictures, setCurrentPictures] = useState<CalendarPicture[]>([]);

  // 使用 useEffect 来处理异步渲染，避免在渲染过程中调用 setState
  useEffect(() => {
    if (currentPictures.length === 0) return;

    setIsLoading(true);
    const poster = new CJMVTTP002Poster(currentPictures);

    poster
      .render()
      .then(canvases => {
        // 将 canvas 元素添加到容器中
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
    (imgs: CalendarPicture[]) => {
      // 只有当有图片时才进行渲染
      if (!imgs || imgs.length === 0) {
        return (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div>请先选择图片</div>
          </div>
        );
      }

      // 更新当前图片，触发 useEffect 进行渲染
      setCurrentPictures(imgs);

      // 返回容器 div
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
      pageWidth={CJ_MVTTP002_WIDTH}
      pageHeight={CJ_MVTTP002_HEIGHT}
      renderPoster={renderPoster}
      storeName="CJ_MVTTP002"
    />
  );
}
