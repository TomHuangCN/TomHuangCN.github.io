/**
 * 日历网格主题接口
 * 定义日历网格的主题样式配置
 */
export interface ICalendarGridTheme {
  /**
   * 主题名称
   */
  name: string;

  /**
   * 主题描述
   */
  description?: string;

  /**
   * 主题颜色配置
   */
  colors: {
    /** 主色调 */
    primary: string;
    /** 次要色调 */
    secondary: string;
    /** 背景色 */
    background: string;
    /** 表面色 */
    surface: string;
    /** 文本主色 */
    textPrimary: string;
    /** 文本次要色 */
    textSecondary: string;
    /** 文本禁用色 */
    textDisabled: string;
    /** 边框色 */
    border: string;
    /** 分割线色 */
    divider: string;
    /** 今天高亮色 */
    today: string;
    /** 周末色 */
    weekend: string;
    /** 其他月份色 */
    otherMonth: string;
    /** 节假日色 */
    holiday: string;
    /** 工作日色 */
    workday: string;
  };

  /**
   * 字体配置
   */
  typography: {
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
    /** 行高 */
    lineHeight: number;
  };

  /**
   * 间距配置
   */
  spacing: {
    /** 基础间距单位 */
    unit: number;
    /** 超小间距 */
    xs: number;
    /** 小间距 */
    sm: number;
    /** 中等间距 */
    md: number;
    /** 大间距 */
    lg: number;
    /** 超大间距 */
    xl: number;
  };

  /**
   * 圆角配置
   */
  borderRadius: {
    /** 无圆角 */
    none: number;
    /** 小圆角 */
    small: number;
    /** 中等圆角 */
    medium: number;
    /** 大圆角 */
    large: number;
  };
}
