import React from "react";
import { EnglishDayData } from "./english-calendar-generator";
import { weekDaysEn, HIGHLIGHT_SUNDAY_COLOR } from "../constants";

export interface EnglishCalendarMonthProps {
  monthData: EnglishDayData[];
  monthIndex: number;
  showMonthTitle: boolean;
  showOtherMonthDays: boolean;
  startDay: number;
  selectedFont: string;
  isEnglish: boolean;
  highlightSunday: boolean;
}

export const EnglishCalendarMonth: React.FC<EnglishCalendarMonthProps> = ({
  monthData,
  monthIndex,
  showMonthTitle,
  showOtherMonthDays,
  startDay,
  selectedFont,
  isEnglish,
  highlightSunday,
}) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
          {monthNames[monthIndex]}
        </h3>
      )}

      {/* 星期标题 */}
      {weekDaysEn.map((day, index) => {
        const weekdayIndex = (index + startDay) % 7;
        const headerColor =
          highlightSunday && weekdayIndex === 0
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
            {weekDaysEn[weekdayIndex]}
          </li>
        );
      })}

      {/* 日期 */}
      {monthData.map((dayData, dayIndex) => (
        <EnglishCalendarDay
          key={dayIndex}
          dayData={dayData}
          showOtherMonthDays={showOtherMonthDays}
          highlightSunday={highlightSunday}
        />
      ))}
    </ul>
  );
};

interface EnglishCalendarDayProps {
  dayData: EnglishDayData;
  showOtherMonthDays: boolean;
  highlightSunday: boolean;
}

const EnglishCalendarDay: React.FC<EnglishCalendarDayProps> = ({
  dayData,
  showOtherMonthDays,
  highlightSunday,
}) => {
  return (
    <li
      style={{
        position: "relative",
        float: "left",
        width: "50px",
        height: "32px",
        cursor: "default",
        textAlign: "center",
        marginTop: "6px",
        lineHeight: "32px",
        fontWeight: "normal",
        color: highlightSunday && dayData.isSunday ? HIGHLIGHT_SUNDAY_COLOR : "#444",
        opacity: !dayData.isCurrentMonth ? 0.3 : 1,
        visibility:
          !showOtherMonthDays && !dayData.isCurrentMonth ? "hidden" : "visible",
      }}
    >
      {dayData.day}
    </li>
  );
};
