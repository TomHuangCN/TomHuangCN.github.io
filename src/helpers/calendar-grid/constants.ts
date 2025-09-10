import { FontOption } from "./types";

export const baseFontOptions: FontOption[] = [
  {
    name: "系统默认",
    value:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    displayName: "系统默认",
    isLoading: false,
    isLoaded: true,
  },
  {
    name: "Xiaolai",
    value: "'Xiaolai', cursive",
    displayName: "小赖手写体",
    isLoading: true,
    isLoaded: false,
  },
  {
    name: "VonwaonBitmap-12px",
    value: "'VonwaonBitmap-12px', monospace",
    displayName: "Vonwaon点阵体",
    isLoading: true,
    isLoaded: false,
  },
  {
    name: "千图小兔体",
    value: "'千图小兔体', cursive",
    displayName: "千图小兔体",
    isLoading: true,
    isLoaded: false,
  },
];

// 为了向后兼容，保留fontOptions
export const fontOptions = baseFontOptions;

/**
 * 获取所有字体选项（包括自定义字体）
 */
export const getAllFontOptions = async (): Promise<FontOption[]> => {
  try {
    // 动态导入FontStorage以避免循环依赖
    const { FontStorage } = await import("../storage/font-storage");
    const fontStorage = new FontStorage();
    const customFonts = await fontStorage.getAllCustomFonts();

    // 创建自定义字体选项
    const customFontOptions: FontOption[] = customFonts.map(font => ({
      name: font.name,
      value: `'${font.name}', cursive`,
      displayName: font.displayName,
      isLoading: false,
      isLoaded: true, // 自定义字体已经加载到内存中
    }));

    // 合并内置字体和自定义字体
    return [...baseFontOptions, ...customFontOptions];
  } catch (error) {
    console.error("获取自定义字体失败:", error);
    return baseFontOptions;
  }
};

export const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
export const weekDaysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const HIGHLIGHT_SUNDAY_COLOR = "#D02F12";
export const commonStyles = {
  input: {
    border: "1px solid #D7D9E0",
    padding: "7px",
    borderRadius: "6px",
    background: "#FFFFFF",
    fontSize: "14px",
  },
  button: {
    border: "1px solid #D7D9E0",
    padding: "7px 15px",
    borderRadius: "6px",
    background: "#FFFFFF",
    fontSize: "14px",
    cursor: "pointer",
  },
  select: {
    border: "1px solid #D7D9E0",
    padding: "7px",
    borderRadius: "6px",
    background: "#FFFFFF",
    fontSize: "14px",
  },
} as const;
