import React from "react";
import { BaseCalendarGrid, generateEnglishCalendarData, convertEnglishDataToDayData } from "../../helpers/calendar-grid/shared";
import { downloadAllImages } from "../../helpers/calendar-grid/download-service";

export const EnglishCalendarGrid: React.FC = () => {
  // 英语版本的日历数据生成函数
  const generateEnglishCalendar = (year: number, startDay: number) => {
    const englishData = generateEnglishCalendarData(year, startDay);
    return convertEnglishDataToDayData(englishData);
  };

  return (
    <BaseCalendarGrid
      generateCalendarData={generateEnglishCalendar}
      downloadService={downloadAllImages}
      defaultFont="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      defaultIsEnglish={true}
      defaultHighlightSunday={false}
    />
  );
};
