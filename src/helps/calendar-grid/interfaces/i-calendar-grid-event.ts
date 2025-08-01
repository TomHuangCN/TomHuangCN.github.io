/**
 * 日历事件数据接口
 * 定义日历事件的属性和结构
 */
export interface ICalendarGridEvent {
  /**
   * 事件唯一标识符
   */
  id: string;

  /**
   * 事件标题
   */
  title: string;

  /**
   * 事件描述
   */
  description?: string;

  /**
   * 事件开始时间
   */
  startTime: Date;

  /**
   * 事件结束时间
   */
  endTime: Date;

  /**
   * 是否为全天事件
   */
  isAllDay: boolean;

  /**
   * 事件类型
   */
  type?: string;

  /**
   * 事件优先级
   */
  priority?: "low" | "medium" | "high" | "urgent";

  /**
   * 事件状态
   */
  status?: "pending" | "confirmed" | "cancelled" | "completed";

  /**
   * 事件颜色
   */
  color?: string;

  /**
   * 事件背景色
   */
  backgroundColor?: string;

  /**
   * 事件边框色
   */
  borderColor?: string;

  /**
   * 事件图标
   */
  icon?: string;

  /**
   * 事件标签
   */
  tags?: string[];

  /**
   * 事件分类
   */
  category?: string;

  /**
   * 事件位置
   */
  location?: string;

  /**
   * 事件组织者
   */
  organizer?: {
    name: string;
    email?: string;
  };

  /**
   * 事件参与者
   */
  attendees?: Array<{
    name: string;
    email?: string;
    status?: "accepted" | "declined" | "pending" | "tentative";
  }>;

  /**
   * 事件重复规则
   */
  recurrence?: {
    /** 重复类型 */
    type: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
    /** 重复间隔 */
    interval: number;
    /** 重复结束日期 */
    endDate?: Date;
    /** 重复次数 */
    count?: number;
    /** 重复的星期几（用于周重复） */
    weekdays?: number[];
    /** 重复的月份日期（用于月重复） */
    monthDays?: number[];
    /** 重复的月份（用于年重复） */
    months?: number[];
  };
}
