declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    static fromYmd(year: number, month: number, day: number): Solar;
    getWeek(): number;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    toYmd(): string;
    getLunar(): Lunar;
    getFestivals(): string[];
  }

  export class SolarYear {
    static fromYear(year: number): SolarYear;
    getMonths(): SolarMonth[];
  }

  export class SolarMonth {
    getMonth(): number;
    getWeeks(start: number): SolarWeek[];
  }

  export class SolarWeek {
    getDays(): Solar[];
  }

  export class Lunar {
    getDay(): number;
    getMonth(): number;
    getDayInChinese(): string;
    getMonthInChinese(): string;
    getFestivals(): string[];
    getJieQi(): string | null;
  }

  export class HolidayUtil {
    static getHoliday(date: string): Holiday | null;
  }

  export class Holiday {
    isWork(): boolean;
  }
} 