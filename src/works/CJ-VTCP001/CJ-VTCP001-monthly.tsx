import CalendarGen from "../calendar-gen/calendar-gen";
import { useCallback } from "react";
import type { CalendarImage } from "../calendar-gen/calendar-gen";

export default function CJ_VTCP001_Monthly() {
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
