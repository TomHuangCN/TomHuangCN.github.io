import React from "react";
import { BaseCalendarGrid } from "./shared";
import { fontOptions } from "./constants";
import { generateCalendarData } from "./calendar-generator";
import { downloadAllImages } from "./download-service";

export const CalendarGrid: React.FC = () => {
  return (
    <BaseCalendarGrid
      generateCalendarData={generateCalendarData}
      downloadService={downloadAllImages}
      defaultFont={fontOptions[0].value}
      defaultIsEnglish={false}
      defaultHighlightSunday={false}
    />
  );
};
