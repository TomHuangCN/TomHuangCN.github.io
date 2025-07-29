import CalendarGen from "./calendar-gen";
import { useCallback } from "react";
import type { CalendarImage } from "./calendar-gen";

export default function CJ_VTCP001_MonthlyGen() {
  const renderPage = useCallback((img: CalendarImage) => {
    return (
      <div>
        <img src={img.url} alt="" style={{ width: "100%", height: "100%" }} />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "20%",
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 600,
          }}
        ></div>
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
