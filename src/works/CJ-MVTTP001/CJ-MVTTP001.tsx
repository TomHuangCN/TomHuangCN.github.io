import CalendarDemo from "../../helpers/calendar-demo/calendar-demo";
import { useCallback, useState, useRef, useEffect } from "react";
import type { CalendarImage } from "../../helpers/calendar-demo/calendar-demo";
import { CJMVTTP001Poster } from "./cj-mvttp001-poster";

export const CJ_MVTTP001_WIDTH = 1838;
export const CJ_MVTTP001_HEIGHT = 2547;

export default function CJ_MVTTP001() {
  const [isLoading, setIsLoading] = useState(false);
  const canvasRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentImages, setCurrentImages] = useState<CalendarImage[]>([]);

  // 使用 useEffect 来处理异步渲染，避免在渲染过程中调用 setState
  useEffect(() => {
    if (currentImages.length === 0) return;

    setIsLoading(true);
    const poster = new CJMVTTP001Poster(currentImages);

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
  }, [currentImages]);

  const renderPage = useCallback(
    (imgs: CalendarImage[]) => {
      // 只有当有图片时才进行渲染
      if (!imgs || imgs.length === 0) {
        return (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div>请先选择图片</div>
          </div>
        );
      }

      // 更新当前图片，触发 useEffect 进行渲染
      setCurrentImages(imgs);

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
      maxImages={13}
      width={CJ_MVTTP001_WIDTH}
      height={CJ_MVTTP001_HEIGHT}
      renderPage={renderPage}
      storeName="CJ_MVTTP001"
    />
  );
}
