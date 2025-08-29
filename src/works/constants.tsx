import React from "react";
import CJ_MVTTP001 from "./cj-mvttp001/cj-mvttp001";
import CJ_MVTTP002 from "./cj-mvttp002/cj-mvttp002";
import { CalendarGridGen } from "./calendar-grid-gen/calendar-grid-gen";

export interface IWork {
  id: string;
  name: string;
  desc: string;
  content: React.ComponentType | string;
  illustration?: string; // 本地图片的 URL
  tips?: Array<{
    content: string;
    link?: string;
  }>;
}

const works: IWork[] = [
  {
    id: "cj-mvttp001",
    name: "CJ-MVTTP001",
    desc: "图的印刷尺寸是：155mm * 215mm，按 DPI 300 印刷，像素尺寸至少 1838 × 2547",
    content: CJ_MVTTP001,
    illustration: "/assets/CJ-MVTTP001_illustration.png",
    tips: [
      {
        content: "产品编号的含义",
        link: "https://youmind.site/IOoX8F52nYuTDw",
      },
    ],
  },
  {
    id: "cj-mvttp002",
    name: "CJ-MVTTP002",
    desc: "图的印刷尺寸是：145mm * 215mm，按 DPI 300 印刷，像素尺寸至少 1713 × 2540",
    content: CJ_MVTTP002,
    illustration: "/assets/CJ-MVTTP002_illustration.png",
    tips: [
      {
        content: "产品编号的含义",
        link: "https://youmind.site/IOoX8F52nYuTDw",
      },
    ],
  },
  {
    id: "calendar-grid-gen",
    name: "日历网格生成器",
    desc: "生成包含农历、节日、节气的日历网格，支持下载为图片作为素材。如有需要新增的字体，请联系作者提出。免费可商用的字体参考：https://freefonts.space/。",
    content: CalendarGridGen,
  },
];

export const useWorks = (): IWork[] => works;
