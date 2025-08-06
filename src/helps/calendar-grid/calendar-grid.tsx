import React, { useState, useEffect, useCallback } from "react";
import { Solar, SolarYear, HolidayUtil } from "lunar-javascript";
import { htmlToPng } from "../../utils/html-to-png";
import JSZip from "jszip";

interface DayData {
  solar: Solar;
  lunar: ReturnType<Solar["getLunar"]>;
  isToday: boolean;
  isCurrentMonth: boolean;
  festivals: string[];
  lunarFestivals: string[];
  jieQi: string | null;
  holiday: ReturnType<typeof HolidayUtil.getHoliday>;
  isRest: boolean;
}

export const CalendarGrid: React.FC = () => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [startDay, setStartDay] = useState<number>(0);
  const [showMonthTitle, setShowMonthTitle] = useState<boolean>(true);
  const [calendarData, setCalendarData] = useState<DayData[][]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const generateCalendar = useCallback(
    (targetYear: number, weekStart: number) => {
      try {
        if (isNaN(targetYear) || targetYear < 1 || targetYear > 9999) {
          return;
        }

        const solarYear = SolarYear.fromYear(targetYear);
        const months = solarYear.getMonths();
        const today = Solar.fromDate(new Date());
        const newCalendarData: DayData[][] = [];

        for (const month of months) {
          const weeks = month.getWeeks(weekStart);
          const monthData: DayData[] = [];

          for (const week of weeks) {
            const days = week.getDays();
            for (const day of days) {
              const lunar = day.getLunar();
              const solarFestivals = day.getFestivals();
              const lunarFestivals = lunar.getFestivals();
              const jieQi = lunar.getJieQi();
              const holiday = HolidayUtil.getHoliday(day.toYmd());

              monthData.push({
                solar: day,
                lunar,
                isToday: day.toYmd() === today.toYmd(),
                isCurrentMonth: day.getMonth() === month.getMonth(),
                festivals: solarFestivals,
                lunarFestivals,
                jieQi,
                holiday,
                isRest: holiday ? !holiday.isWork() : false,
              });
            }
          }

          newCalendarData.push(monthData);
        }

        setCalendarData(newCalendarData);
      } catch (error) {
        console.error("生成日历数据错误:", error);
      }
    },
    []
  );

  useEffect(() => {
    generateCalendar(year, startDay);
  }, [year, startDay, generateCalendar]);

  const getDayText = (dayData: DayData): string => {
    // 阳历节日
    if (dayData.festivals.length > 0) {
      const festival = dayData.festivals[0];
      return festival.length > 10 ? festival.substring(0, 10) : festival;
    }

    // 农历节日
    if (dayData.lunarFestivals.length > 0) {
      const festival = dayData.lunarFestivals[0];
      return festival.length > 10 ? festival.substring(0, 10) : festival;
    }

    // 节气
    if (dayData.jieQi) {
      return dayData.jieQi.length > 10
        ? dayData.jieQi.substring(0, 10)
        : dayData.jieQi;
    }

    // 初一显示月份
    if (dayData.lunar.getDay() === 1) {
      const monthText = dayData.lunar.getMonthInChinese() + "月";
      return monthText.length > 10 ? monthText.substring(0, 10) : monthText;
    }

    // 默认显示农历日期
    const dayText = dayData.lunar.getDayInChinese();
    return dayText.length > 10 ? dayText.substring(0, 10) : dayText;
  };

  const getDayClasses = (dayData: DayData): string[] => {
    const classes: string[] = [];

    if (dayData.isToday) {
      classes.push("today");
    }

    if (
      dayData.festivals.length > 0 ||
      dayData.lunarFestivals.length > 0 ||
      dayData.jieQi
    ) {
      classes.push("festival");
    }

    if (dayData.isRest) {
      classes.push("rest");
    }

    if (!dayData.isCurrentMonth) {
      classes.push("other");
    }

    return classes;
  };

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  const handleDownloadAllImages = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();

      // 获取所有月份元素
      const monthElements = document.querySelectorAll("#body ul");

      for (let i = 0; i < monthElements.length; i++) {
        const monthElement = monthElements[i] as HTMLElement;
        const monthNumber = i + 1;

        try {
          // 生成PNG图片 (300 DPI)
          const pngData = await htmlToPng(monthElement, {
            width: 370, // 350px + 20px margin
            height: 354, // 334px + 20px margin
            scale: 4, // 300 DPI = 4x scale (72 DPI * 4 = 288 DPI, 接近300 DPI)
          });

          // 将PNG数据转换为Blob并添加到ZIP
          const pngBlob = await fetch(pngData).then(res => res.blob());
          zip.file(`${year}年${monthNumber}月日历.png`, pngBlob);
        } catch (error) {
          console.error(`生成${monthNumber}月图片失败:`, error);
        }
      }

      // 生成并下载ZIP文件
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${year}年日历.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("下载图片失败:", error);
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
      <div
        className="title"
        style={{
          fontSize: "15px",
          color: "#606266",
          marginBottom: "10px",
          textAlign: "center",
        }}
      >
        <input
          type="number"
          value={year}
          onChange={e =>
            setYear(parseInt(e.target.value) || new Date().getFullYear())
          }
          min={1}
          max={9999}
          style={{
            border: "1px solid #D7D9E0",
            padding: "7px",
            borderRadius: "6px",
            background: "#FFFFFF",
            width: "100px",
            textAlign: "center",
            fontSize: "20px",
          }}
        />
        <select
          value={startDay}
          onChange={e => setStartDay(parseInt(e.target.value))}
          style={{
            border: "1px solid #D7D9E0",
            padding: "7px",
            borderRadius: "6px",
            background: "#FFFFFF",
            marginLeft: "10px",
            fontSize: "14px",
          }}
        >
          <option value={0}>周日开始</option>
          <option value={1}>周一开始</option>
        </select>
        <button
          onClick={() => setShowMonthTitle(!showMonthTitle)}
          style={{
            border: "1px solid #D7D9E0",
            padding: "7px 15px",
            borderRadius: "6px",
            background: "#FFFFFF",
            marginLeft: "10px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          {showMonthTitle ? "隐藏月份" : "显示月份"}
        </button>
        <button
          onClick={handleDownloadAllImages}
          disabled={isDownloading}
          style={{
            border: "1px solid #D7D9E0",
            padding: "7px 15px",
            borderRadius: "6px",
            background: "#FFFFFF",
            marginLeft: "10px",
            fontSize: "14px",
            cursor: isDownloading ? "not-allowed" : "pointer",
            opacity: isDownloading ? 0.6 : 1,
          }}
        >
          {isDownloading ? "生成中..." : "下载图片"}
        </button>
      </div>

      <div id="body" style={{ overflow: "hidden" }}>
        {calendarData.map((monthData, monthIndex) => (
          <ul
            key={monthIndex}
            style={{
              position: "relative",
              display: "block",
              width: "350px",
              height: "334px",
              float: "left",
              listStyle: "none",
              // backgroundColor: "#FAFAFA",
              margin: "10px",
              padding: 0,
            }}
          >
            {showMonthTitle && (
              <h3
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  fontSize: "80px",
                  width: "100%",
                  height: "334px",
                  textAlign: "center",
                  lineHeight: "334px",
                  color: "#333",
                  opacity: 0.1,
                  margin: 0,
                }}
              >
                {monthIndex + 1}月
              </h3>
            )}

            {/* 星期标题 */}
            {weekDays.map((day, index) => (
              <li
                key={index}
                className="week"
                style={{
                  position: "relative",
                  float: "left",
                  width: "50px",
                  height: "34px",
                  lineHeight: "33px",
                  fontSize: "12px",
                  color: "#333333",
                  borderBottom: "1px solid #E3E3E3",
                  textAlign: "center",
                }}
              >
                {weekDays[(index + startDay) % 7]}
              </li>
            ))}

            {/* 日期 */}
            {monthData.map((dayData, dayIndex) => (
              <li
                key={dayIndex}
                className={getDayClasses(dayData).join(" ")}
                style={{
                  position: "relative",
                  float: "left",
                  width: "50px",
                  height: "50px",
                  cursor: "default",
                  textAlign: "center",
                  fontWeight: dayData.isToday ? "bold" : "normal",
                  color: dayData.isToday ? "#1f80a9" : "#444",
                  opacity: !dayData.isCurrentMonth ? 0.3 : 1,
                }}
              >
                {dayData.solar.getDay()}
                <i
                  style={{
                    display: "block",
                    fontSize: "9px",
                    fontStyle: "normal",
                    color: dayData.isToday
                      ? "#1f80a9"
                      : dayData.festivals.length > 0 ||
                          dayData.lunarFestivals.length > 0 ||
                          dayData.jieQi
                        ? "#D02F12"
                        : "#999999",
                    overflow: "hidden",
                  }}
                >
                  {getDayText(dayData)}
                </i>
                {dayData.holiday && (
                  <u
                    style={{
                      fontSize: "9px",
                      fontStyle: "normal",
                      textDecoration: "none",
                      position: "absolute",
                      right: "4px",
                      top: 0,
                      color: dayData.isRest ? "#5CB85C" : "#333",
                    }}
                  >
                    {dayData.isRest ? "休" : "班"}
                  </u>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
};
