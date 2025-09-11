import React from "react";
import { CalendarDayProps } from "./types";
import {
  getDayText,
  getDayClasses,
  getDayColor,
  getRestDayColor,
} from "./utils";
import { HIGHLIGHT_SUNDAY_COLOR } from "./constants";

export const CalendarDay: React.FC<CalendarDayProps> = ({
  dayData,
  showOtherMonthDays,
  isEnglish,
  highlightSunday,
}) => {
  const dayClasses = getDayClasses(dayData);
  const dayText = isEnglish ? "" : getDayText(dayData);
  const baseColor = getDayColor(dayData);
  const textColor =
    highlightSunday && dayData.isSunday
      ? HIGHLIGHT_SUNDAY_COLOR
      : baseColor;
  const restDayColor = getRestDayColor(dayData);

  return (
    <li
      className={dayClasses.join(" ")}
      style={{
        position: "relative",
        float: "left",
        width: "50px",
        height: isEnglish ? "32px" : "44px",
        cursor: "default",
        textAlign: "center",
        marginTop: "6px",
        lineHeight: "1.2",
        fontWeight: "normal",
        color: "#444",
        opacity: !dayData.isCurrentMonth ? 0.3 : 1,
        visibility:
          !showOtherMonthDays && !dayData.isCurrentMonth ? "hidden" : "visible",
      }}
    >
      <span
        style={{
          color:
            highlightSunday && dayData.isSunday
              ? HIGHLIGHT_SUNDAY_COLOR
              : "inherit",
        }}
      >
        {dayData.solar.getDay()}
      </span>
      {!isEnglish && (
        <i
          style={{
            display: "block",
            fontSize: "9px",
            fontStyle: "normal",
            color: textColor,
            overflow: "hidden",
          }}
        >
          {dayText}
        </i>
      )}
      {!isEnglish && dayData.holiday && (
        <u
          style={{
            fontSize: "9px",
            fontStyle: "normal",
            textDecoration: "none",
            position: "absolute",
            right: "4px",
            top: 0,
            color: restDayColor,
          }}
        >
          {dayData.isRest ? "休" : "班"}
        </u>
      )}
    </li>
  );
};
