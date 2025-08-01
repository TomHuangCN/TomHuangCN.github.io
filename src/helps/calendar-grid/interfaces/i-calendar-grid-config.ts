/**
 * 日历网格配置接口
 * 定义日历网格的渲染配置选项
 */
export interface ICalendarGridConfig {
  /**
   * 基础配置
   */
  basic: {
    /** 是否显示表头（星期标题） */
    showHeader: boolean;
    /** 是否显示今天高亮 */
    highlightToday: boolean;
    /** 是否显示周末 */
    showWeekends: boolean;
    /** 是否显示其他月份的日期 */
    showOtherMonthDates: boolean;
    /** 是否显示日期编号 */
    showDateNumbers: boolean;
    /** 是否显示事件指示器 */
    showEventIndicators: boolean;
  };

  /**
   * 布局配置
   */
  layout: {
    /** 网格布局类型 */
    gridType: "month" | "week" | "custom";
    /** 每行显示的日期数量 */
    daysPerRow: number;
    /** 单元格高度 */
    cellHeight: number;
    /** 单元格宽度 */
    cellWidth: number;
    /** 单元格内边距 */
    cellPadding: number;
    /** 单元格间距 */
    cellSpacing: number;
    /** 画布宽度 */
    canvasWidth: number;
    /** 画布高度 */
    canvasHeight: number;
  };

  /**
   * 样式配置
   */
  styling: {
    /** 主题名称 */
    theme: string;
    /** 容器样式 */
    containerStyle: Record<string, string>;
    /** 单元格样式 */
    cellStyle: Record<string, string>;
    /** 今天单元格样式 */
    todayCellStyle: Record<string, string>;
    /** 其他月份单元格样式 */
    otherMonthCellStyle: Record<string, string>;
    /** 周末单元格样式 */
    weekendCellStyle: Record<string, string>;
    /** 事件样式 */
    eventStyle: Record<string, string>;
    /** 表头样式 */
    headerStyle: Record<string, string>;
  };

  /**
   * 本地化配置
   */
  localization: {
    /** 语言代码 */
    language: string;
    /** 星期开始日 (0=周日, 1=周一) */
    weekStart: 0 | 1;
    /** 月份名称 */
    monthNames: string[];
    /** 星期名称 */
    weekdayNames: string[];
    /** 星期名称缩写 */
    weekdayNamesShort: string[];
    /** 日期格式 */
    dateFormat: string;
    /** 时间格式 */
    timeFormat: string;
  };

  /**
   * 事件配置
   */
  events: {
    /** 最大显示事件数量 */
    maxEventsPerDay: number;
    /** 事件显示模式 */
    displayMode: "list" | "grid" | "overlay";
    /** 是否显示事件时间 */
    showEventTime: boolean;
    /** 是否显示事件标题 */
    showEventTitle: boolean;
    /** 事件类型颜色映射 */
    eventTypeColors: Record<string, string>;
    /** 事件优先级颜色映射 */
    eventPriorityColors: Record<string, string>;
  };

  /**
   * 字体配置
   */
  fonts: {
    /** 字体族 */
    fontFamily: string;
    /** 基础字体大小 */
    fontSize: number;
    /** 小字体大小 */
    fontSizeSmall: number;
    /** 大字体大小 */
    fontSizeLarge: number;
    /** 标题字体大小 */
    fontSizeTitle: number;
    /** 字体粗细 */
    fontWeight: string;
    /** 标题字体粗细 */
    fontWeightTitle: string;
  };
}
