import React, { useState, useEffect, useCallback } from "react";
import { fontOptions } from "./constants";
import { generateCalendarData } from "./calendar-generator";
import { downloadAllImages } from "./download-service";
import { CalendarControls } from "./calendar-controls";
import { CalendarMonth } from "./calendar-month";
import { DayData } from "./types";

export const CalendarGrid: React.FC = () => {
  const [year, setYear] = useState<number>(2026);
  const [startDay, setStartDay] = useState<number>(0);
  const [showMonthTitle, setShowMonthTitle] = useState<boolean>(false);
  const [showOtherMonthDays, setShowOtherMonthDays] = useState<boolean>(false);
  const [selectedFont, setSelectedFont] = useState<string>(
    fontOptions[0].value
  );
  const [calendarData, setCalendarData] = useState<DayData[][]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // 生成样机数据
  const generateCalendar = useCallback(
    (targetYear: number, weekStart: number) => {
      const data = generateCalendarData(targetYear, weekStart);
      setCalendarData(data);
    },
    []
  );

  // 当年份或起始日变化时重新生成样机
  useEffect(() => {
    generateCalendar(year, startDay);
  }, [year, startDay, generateCalendar]);

  // 处理下载
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadAllImages(year);
    } catch (error) {
      console.error("下载失败:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      id="calendar"
      style={{
        margin: "0 auto",
        padding: 0,
        boxSizing: "border-box",
        width: "900px",
      }}
    >
      <CalendarControls
        year={year}
        setYear={setYear}
        startDay={startDay}
        setStartDay={setStartDay}
        showMonthTitle={showMonthTitle}
        setShowMonthTitle={setShowMonthTitle}
        showOtherMonthDays={showOtherMonthDays}
        setShowOtherMonthDays={setShowOtherMonthDays}
        selectedFont={selectedFont}
        setSelectedFont={setSelectedFont}
        isDownloading={isDownloading}
        onDownload={handleDownload}
      />

      <div id="body" style={{ overflow: "hidden" }}>
        {calendarData.map((monthData, monthIndex) => (
          <CalendarMonth
            key={monthIndex}
            monthData={monthData}
            monthIndex={monthIndex}
            showMonthTitle={showMonthTitle}
            showOtherMonthDays={showOtherMonthDays}
            startDay={startDay}
            selectedFont={selectedFont}
          />
        ))}
      </div>
    </div>
  );
};
