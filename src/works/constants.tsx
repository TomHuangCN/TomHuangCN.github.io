import CJ_VTCP001_MonthlyGen from "./calendar-gen/CJ-VTCP001-monthly-gen";
import React from "react";

export interface IWork {
  id: string;
  name: string;
  desc: string;
  content: React.ComponentType | string;
  illustration?: string; // 本地图片的 URL
}

export const useWorks = (): IWork[] => {
  return [
    {
      id: "monthly-calendar-gen",
      name: "月历 CJ-VTCP001",
      desc: "辅助生成各式各样的月历，支持自定义图片、布局和样式，快速生成精美的月历作品",
      content: CJ_VTCP001_MonthlyGen,
      illustration: "/assets/CJ-VTCP001_illustration.png",
    },
  ];
};
