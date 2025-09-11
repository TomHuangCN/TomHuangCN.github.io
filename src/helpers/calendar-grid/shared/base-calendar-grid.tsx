import React, { useState, useEffect, useCallback } from "react";
import { CalendarControls } from "../calendar-controls";
import { CalendarMonth } from "../calendar-month";
import { DayData } from "../types";

export interface BaseCalendarGridProps {
  /** 日历数据生成函数 */
  generateCalendarData: (year: number, startDay: number) => DayData[][];
  /** 下载服务函数 */
  downloadService?: (year: number) => Promise<void>;
  /** 默认年份 */
  defaultYear?: number;
  /** 默认起始日 */
  defaultStartDay?: number;
  /** 默认字体 */
  defaultFont?: string;
  /** 是否默认显示月份标题 */
  defaultShowMonthTitle?: boolean;
  /** 是否默认显示其他月份日期 */
  defaultShowOtherMonthDays?: boolean;
  /** 是否默认英语模式 */
  defaultIsEnglish?: boolean;
  /** 是否默认高亮周日 */
  defaultHighlightSunday?: boolean;
  /** 容器样式 */
  containerStyle?: React.CSSProperties;
}

export const BaseCalendarGrid: React.FC<BaseCalendarGridProps> = ({
  generateCalendarData,
  downloadService,
  defaultYear = 2026,
  defaultStartDay = 0,
  defaultFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  defaultShowMonthTitle = false,
  defaultShowOtherMonthDays = false,
  defaultIsEnglish = false,
  defaultHighlightSunday = false,
  containerStyle = {},
}) => {
  const [year, setYear] = useState<number>(defaultYear);
  const [startDay, setStartDay] = useState<number>(defaultStartDay);
  const [showMonthTitle, setShowMonthTitle] = useState<boolean>(defaultShowMonthTitle);
  const [showOtherMonthDays, setShowOtherMonthDays] = useState<boolean>(defaultShowOtherMonthDays);
  const [selectedFont, setSelectedFont] = useState<string>(defaultFont);
  const [calendarData, setCalendarData] = useState<DayData[][]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isEnglish, setIsEnglish] = useState<boolean>(defaultIsEnglish);
  const [highlightSunday, setHighlightSunday] = useState<boolean>(defaultHighlightSunday);

  // 生成样机数据
  const generateCalendar = useCallback(
    (targetYear: number, weekStart: number) => {
      const data = generateCalendarData(targetYear, weekStart);
      setCalendarData(data);
    },
    [generateCalendarData]
  );

  // 初始化时加载自定义字体
  useEffect(() => {
    const initCustomFonts = async () => {
      try {
        const { loadCustomFonts } = await import("../../../utils/font-loader");
        await loadCustomFonts();
        console.log("自定义字体加载完成");
      } catch (error) {
        console.error("加载自定义字体失败:", error);
      }
    };

    initCustomFonts();
  }, []);

  // 当年份或起始日变化时重新生成样机
  useEffect(() => {
    generateCalendar(year, startDay);
  }, [year, startDay, generateCalendar]);

  // 处理下载
  const handleDownload = async () => {
    if (!downloadService) return;
    
    setIsDownloading(true);
    try {
      await downloadService(year);
    } catch (error) {
      console.error("下载失败:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const defaultContainerStyle: React.CSSProperties = {
    margin: "0 auto",
    padding: 0,
    boxSizing: "border-box",
    width: "900px",
    maxWidth: "100%",
    ...containerStyle,
  };

  return (
    <div
      id="calendar"
      className="calendar-container"
      style={defaultContainerStyle}
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
        highlightSunday={highlightSunday}
        setHighlightSunday={setHighlightSunday}
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
            isEnglish={isEnglish}
            highlightSunday={highlightSunday}
          />
        ))}
      </div>
    </div>
  );
};
