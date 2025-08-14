import { FontOption } from "./types";

export const fontOptions: FontOption[] = [
  {
    name: "系统默认",
    value:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    displayName: "系统默认",
    isLoading: false,
    isLoaded: true,
  },
  {
    name: "Ma Shan Zheng",
    value: "'Ma Shan Zheng', cursive",
    displayName: "马善政手写体",
    isLoading: true,
    isLoaded: false,
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

export const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

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
