import { DayData } from "./types";

/**
 * 获取日期显示文本
 */
export const getDayText = (dayData: DayData): string => {
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

/**
 * 获取日期CSS类名
 */
export const getDayClasses = (dayData: DayData): string[] => {
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

/**
 * 获取日期颜色
 */
export const getDayColor = (dayData: DayData): string => {
  if (dayData.isToday) {
    return "#1f80a9";
  }

  if (
    dayData.festivals.length > 0 ||
    dayData.lunarFestivals.length > 0 ||
    dayData.jieQi
  ) {
    return "#D02F12";
  }

  return "#999999";
};

/**
 * 获取休息日颜色
 */
export const getRestDayColor = (dayData: DayData): string => {
  return dayData.isRest ? "#5CB85C" : "#333";
};
