import { ICalendarGridRenderer } from "./i-calendar-grid-renderer";
import { ICalendarGridConfig } from "./i-calendar-grid-config";
import { ICalendarGridEvent } from "./i-calendar-grid-event";

/**
 * 日历网格主类接口
 * 负责管理日历网格的渲染
 */
export interface ICalendarGrid {
  /**
   * 初始化日历网格
   * @param config 配置选项
   * @param canvas Canvas元素
   */
  initialize(
    config: ICalendarGridConfig,
    canvas: HTMLCanvasElement
  ): Promise<void>;

  /**
   * 渲染指定月份的日历网格
   * @param year 年份
   * @param month 月份 (1-12)
   */
  renderMonth(year: number, month: number): Promise<void>;

  /**
   * 渲染指定日期范围的日历网格
   * @param startDate 开始日期
   * @param endDate 结束日期
   */
  renderDateRange(startDate: Date, endDate: Date): Promise<void>;

  /**
   * 更新日历数据
   * @param events 事件数据
   */
  updateEvents(events: ICalendarGridEvent[]): Promise<void>;

  /**
   * 设置渲染器
   * @param renderer 渲染器实例
   */
  setRenderer(renderer: ICalendarGridRenderer): void;

  /**
   * 获取当前显示的日期范围
   */
  getCurrentDateRange(): { start: Date; end: Date };

  /**
   * 获取当前配置
   */
  getConfig(): ICalendarGridConfig;

  /**
   * 更新配置
   * @param config 新的配置选项
   */
  updateConfig(config: Partial<ICalendarGridConfig>): Promise<void>;

  /**
   * 销毁日历网格，清理资源
   */
  destroy(): Promise<void>;

  /**
   * 刷新当前视图
   */
  refresh(): Promise<void>;
}
