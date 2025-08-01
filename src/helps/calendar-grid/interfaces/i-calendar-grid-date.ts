/**
 * 日历网格日期数据接口
 * 定义日历网格中每个日期单元格的数据结构
 */
export interface ICalendarGridDate {
  /**
   * 日期对象
   */
  date: Date;

  /**
   * 日期编号 (1-31)
   */
  dayNumber: number;

  /**
   * 星期几 (0-6, 0=周日)
   */
  weekday: number;

  /**
   * 是否为今天
   */
  isToday: boolean;

  /**
   * 是否为当前月份
   */
  isCurrentMonth: boolean;

  /**
   * 是否为周末
   */
  isWeekend: boolean;

  /**
   * 是否为工作日
   */
  isWorkday: boolean;

  /**
   * 是否为节假日
   */
  isHoliday: boolean;

  /**
   * 日期标签
   */
  label?: string;

  /**
   * 日期颜色
   */
  color?: string;

  /**
   * 日期背景色
   */
  backgroundColor?: string;

  /**
   * 日期边框色
   */
  borderColor?: string;

  /**
   * 日期数据
   */
  data?: {
    /** 农历日期 */
    lunar?: string;
    /** 节气 */
    solarTerm?: string;
    /** 节日 */
    festival?: string;
  };

  /**
   * 日期事件数量
   */
  eventCount: number;

  /**
   * 日期事件预览
   */
  eventPreview?: Array<{
    id: string;
    title: string;
    type?: string;
    color?: string;
    time?: string;
  }>;
}
