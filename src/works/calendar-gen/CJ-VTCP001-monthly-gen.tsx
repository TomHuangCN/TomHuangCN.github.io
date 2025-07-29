import CalendarGen from "./calendar-gen";
import { useCallback } from "react";
import type { CalendarImage } from "./calendar-gen";

export default function CJ_VTCP001_MonthlyGen() {
  const renderPage = useCallback((imgs: CalendarImage[]) => {
    console.log(imgs);
    return <div>333</div>;
  }, []);

  return (
    <CalendarGen
      maxImages={13}
      renderPage={renderPage}
      storeName="monthly_calendars"
    />
  );
}
