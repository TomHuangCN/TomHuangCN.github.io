import { Solar } from "lunar-javascript";
import { HolidayUtil } from "lunar-javascript";

export interface DayData {
  solar: Solar;
  lunar: ReturnType<Solar["getLunar"]>;
  isToday: boolean;
  isCurrentMonth: boolean;
  festivals: string[];
  lunarFestivals: string[];
  jieQi: string | null;
  holiday: ReturnType<typeof HolidayUtil.getHoliday>;
  isRest: boolean;
  isSunday: boolean;
}

export interface FontOption {
  name: string;
  value: string;
  displayName: string;
  isLoading?: boolean;
  isLoaded?: boolean;
}

export interface CalendarControlsProps {
  year: number;
  setYear: (year: number) => void;
  startDay: number;
  setStartDay: (startDay: number) => void;
  showMonthTitle: boolean;
  setShowMonthTitle: (show: boolean) => void;
  showOtherMonthDays: boolean;
  setShowOtherMonthDays: (show: boolean) => void;
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  isDownloading: boolean;
  onDownload: () => void;
  highlightSunday: boolean;
  setHighlightSunday: (highlight: boolean) => void;
}

export interface CalendarMonthProps {
  monthData: DayData[];
  monthIndex: number;
  showMonthTitle: boolean;
  showOtherMonthDays: boolean;
  startDay: number;
  selectedFont: string;
  isEnglish: boolean;
  highlightSunday: boolean;
}

export interface CalendarDayProps {
  dayData: DayData;
  startDay: number;
  showOtherMonthDays: boolean;
  isEnglish: boolean;
  highlightSunday: boolean;
}
