import CalendarGen from "../calendar-gen/calendar-gen";
import { useCallback, useState, useRef } from "react";
import type { CalendarImage } from "../calendar-gen/calendar-gen";
import { CJVTCP001Renderer } from "./CJ-VTCP001-renderer";

export default function CJ_VTCP001_Monthly() {
  const [isLoading, setIsLoading] = useState(false);
  const canvasRefs = useRef<(HTMLDivElement | null)[]>([]);

  const renderPage = useCallback((imgs: CalendarImage[]) => {
    // 只有当有图片时才进行渲染
    if (!imgs || imgs.length === 0) {
      return (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div>请先选择图片</div>
        </div>
      );
    }

    setIsLoading(true);

    // 异步渲染
    const renderer = new CJVTCP001Renderer(imgs);
    renderer
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

    // 返回容器 div
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", width: "100%" }}>
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
  }, []);

  return (
    <CalendarGen
      maxImages={13}
      renderPage={renderPage}
      storeName="monthly_calendars"
    />
  );
}
