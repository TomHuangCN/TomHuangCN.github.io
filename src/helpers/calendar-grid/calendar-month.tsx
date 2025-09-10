import React from "react";
import { CalendarMonthProps } from "./types";
import { weekDays, weekDaysEn, HIGHLIGHT_SUNDAY_COLOR } from "./constants";
import { CalendarDay } from "./calendar-day";

export const CalendarMonth: React.FC<CalendarMonthProps> = ({
  monthData,
  monthIndex,
  showMonthTitle,
  showOtherMonthDays,
  startDay,
  selectedFont,
  isEnglish,
  highlightSunday,
}) => {
  return (
    <ul
      style={{
        position: "relative",
        display: "block",
        width: "350px",
        height: "334px",
        float: "left",
        listStyle: "none",
        margin: "10px",
        padding: 0,
        fontFamily: selectedFont,
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
      {weekDays.map((day, index) => {
        const weekdayIndex = (index + startDay) % 7;
        const headerColor =
          isEnglish && highlightSunday && weekdayIndex === 0
            ? HIGHLIGHT_SUNDAY_COLOR
            : "#333333";
        return (
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
              color: headerColor,
              textAlign: "center",
            }}
          >
            {(isEnglish ? weekDaysEn : weekDays)[weekdayIndex]}
          </li>
        );
      })}

      {/* 日期 */}
      {monthData.map((dayData, dayIndex) => (
        <CalendarDay
          key={dayIndex}
          dayData={dayData}
          startDay={startDay}
          showOtherMonthDays={showOtherMonthDays}
          isEnglish={isEnglish}
          highlightSunday={highlightSunday}
        />
      ))}
    </ul>
  );
};
