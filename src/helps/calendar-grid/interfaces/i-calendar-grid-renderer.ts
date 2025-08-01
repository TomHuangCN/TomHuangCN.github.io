import { ICalendarGridConfig } from "./i-calendar-grid-config";
import { ICalendarGridEvent } from "./i-calendar-grid-event";
import { ICalendarGridDate } from "./i-calendar-grid-date";

/**
 * 日历网格渲染器接口
 * 负责Canvas渲染逻辑
 */
export interface ICalendarGridRenderer {
  /**
   * 初始化渲染器
   * @param canvas Canvas元素
   * @param config 配置选项
   */
  initialize(
    canvas: HTMLCanvasElement,
    config: ICalendarGridConfig
  ): Promise<void>;

  /**
   * 渲染日历网格
   * @param dates 日期数据数组
   * @param events 事件数据数组
   */
  render(
    dates: ICalendarGridDate[],
    events: ICalendarGridEvent[]
  ): Promise<void>;

  /**
   * 渲染单个日期单元格
   * @param date 日期数据
   * @param events 该日期的事件
   * @param x X坐标
   * @param y Y坐标
   * @param width 宽度
   * @param height 高度
   */
  renderDateCell(
    date: ICalendarGridDate,
    events: ICalendarGridEvent[],
    x: number,
    y: number,
    width: number,
    height: number
  ): void;

  /**
   * 渲染事件
   * @param event 事件数据
   * @param x X坐标
   * @param y Y坐标
   * @param width 宽度
   * @param height 高度
   */
  renderEvent(
    event: ICalendarGridEvent,
    x: number,
    y: number,
    width: number,
    height: number
  ): void;

  /**
   * 渲染表头（星期标题）
   * @param weekdays 星期数组
   * @param x X坐标
   * @param y Y坐标
   * @param width 宽度
   * @param height 高度
   */
  renderHeader(
    weekdays: string[],
    x: number,
    y: number,
    width: number,
    height: number
  ): void;

  /**
   * 更新样式
   * @param config 新的配置选项
   */
  updateStyles(config: ICalendarGridConfig): Promise<void>;

  /**
   * 设置主题
   * @param theme 主题对象
   */
  setTheme(theme: object): Promise<void>;

  /**
   * 获取Canvas上下文
   */
  getContext(): CanvasRenderingContext2D;

  /**
   * 销毁渲染器，清理资源
   */
  destroy(): Promise<void>;

  /**
   * 刷新渲染
   */
  refresh(): Promise<void>;
}
