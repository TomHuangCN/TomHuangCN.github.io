import React, { useState, useEffect, useCallback } from "react";
import { Solar, SolarYear, HolidayUtil } from "lunar-javascript";

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
  const [calendarData, setCalendarData] = useState<DayData[][]>([]);

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
              backgroundColor: "#FAFAFA",
              margin: "10px",
              padding: 0,
            }}
          >
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
