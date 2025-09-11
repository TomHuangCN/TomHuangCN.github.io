import { DayData } from "../types";

export interface EnglishDayData {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSunday: boolean;
  monthName: string;
  year: number;
}

/**
 * 生成英语版本的日历数据
 */
export function generateEnglishCalendarData(year: number, weekStart: number): EnglishDayData[][] {
  const months: EnglishDayData[][] = [];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  for (let month = 0; month < 12; month++) {
    const monthData: EnglishDayData[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // 获取第一天是星期几
    const firstDayOfWeek = (firstDay.getDay() - weekStart + 7) % 7;
    
    // 添加上个月的日期
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
      const day = prevMonthLastDay - firstDayOfWeek + i + 1;
      
      monthData.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSunday: (i + weekStart) % 7 === 0,
        monthName: monthNames[prevMonth],
        year: prevYear
      });
    }
    
    // 添加当前月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = (currentDate.getDay() - weekStart + 7) % 7;
      
      monthData.push({
        day,
        isCurrentMonth: true,
        isToday: false, // 简化处理，不判断今天
        isSunday: dayOfWeek === 0,
        monthName: monthNames[month],
        year
      });
    }
    
    // 添加下个月的日期以填满网格
    const remainingDays = 42 - monthData.length; // 6行 x 7天 = 42
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dayOfWeek = (monthData.length + day - 1) % 7;
      
      monthData.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSunday: dayOfWeek === 0,
        monthName: monthNames[nextMonth],
        year: nextYear
      });
    }
    
    months.push(monthData);
  }
  
  return months;
}

/**
 * 将英语日历数据转换为 DayData 格式（用于兼容现有组件）
 */
export function convertEnglishDataToDayData(englishData: EnglishDayData[][]): DayData[][] {
  return englishData.map(monthData => 
    monthData.map(dayData => ({
      solar: {
        getDay: () => dayData.day,
        getMonth: () => {
          const monthIndex = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ].indexOf(dayData.monthName);
          return monthIndex + 1;
        },
        getYear: () => dayData.year,
      } as any,
      lunar: {} as any,
      isToday: dayData.isToday,
      isCurrentMonth: dayData.isCurrentMonth,
      festivals: [],
      lunarFestivals: [],
      jieQi: null,
      holiday: null,
      isRest: false,
      isSunday: dayData.isSunday,
    }))
  );
}
