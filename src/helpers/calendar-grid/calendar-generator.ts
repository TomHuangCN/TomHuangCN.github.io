import { Solar, SolarYear, HolidayUtil } from "lunar-javascript";
import { DayData } from "./types";

/**
 * 生成指定年份的日历数据
 */
export const generateCalendarData = (
  targetYear: number,
  weekStart: number
): DayData[][] => {
  try {
    if (isNaN(targetYear) || targetYear < 1 || targetYear > 9999) {
      return [];
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
            isSunday: day.getWeek() === 0,
          });
        }
      }

      newCalendarData.push(monthData);
    }

    return newCalendarData;
  } catch (error) {
    console.error("生成样机数据错误:", error);
    return [];
  }
};
