import React from "react";
import { CalendarDayProps } from "./types";
import {
  getDayText,
  getDayClasses,
  getDayColor,
  getRestDayColor,
} from "./utils";

export const CalendarDay: React.FC<CalendarDayProps> = ({
  dayData,
  showOtherMonthDays,
}) => {
  const dayClasses = getDayClasses(dayData);
  const dayText = getDayText(dayData);
  const textColor = getDayColor(dayData);
  const restDayColor = getRestDayColor(dayData);

  return (
    <li
      className={dayClasses.join(" ")}
      style={{
        position: "relative",
        float: "left",
        width: "50px",
        height: "44px",
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
      {dayData.solar.getDay()}
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
      {dayData.holiday && (
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
