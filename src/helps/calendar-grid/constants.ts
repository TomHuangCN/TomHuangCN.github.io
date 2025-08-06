import { FontOption } from "./types";

export const fontOptions: FontOption[] = [
  {
    name: "系统默认",
    value:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    displayName: "系统默认",
  },
  {
    name: "Noto Sans SC",
    value: "'Noto Sans SC', sans-serif",
    displayName: "Noto Sans SC",
  },
  {
    name: "Noto Serif SC",
    value: "'Noto Serif SC', serif",
    displayName: "Noto Serif SC",
  },
  {
    name: "Source Han Sans CN",
    value: "'Source Han Sans CN', sans-serif",
    displayName: "Source Han Sans CN",
  },
  {
    name: "Source Han Serif CN",
    value: "'Source Han Serif CN', serif",
    displayName: "Source Han Serif CN",
  },
  {
    name: "LXGW WenKai",
    value: "'LXGW WenKai', monospace",
    displayName: "霞鹜文楷",
  },
  {
    name: "Ma Shan Zheng",
    value: "'Ma Shan Zheng', cursive",
    displayName: "马善政手写体",
  },
  {
    name: "Han Yi Shou Xie Ti",
    value: "'Han Yi Shou Xie Ti', cursive",
    displayName: "汉仪手写体",
  },
  {
    name: "Kai Ti",
    value: "'Kai Ti', cursive",
    displayName: "楷体手写体",
  },
  {
    name: "Xiaolai",
    value: "'Xiaolai', cursive",
    displayName: "小赖手写体",
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
