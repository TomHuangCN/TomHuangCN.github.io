import React from "react";
import CJ_MVTTP001, {
  CJ_MVTTP001_HEIGHT,
  CJ_MVTTP001_WIDTH,
} from "./cj-mvttp001/cj-mvttp001";
import CJ_MVTTP002, {
  CJ_MVTTP002_HEIGHT,
  CJ_MVTTP002_WIDTH,
} from "./cj-mvttp002/cj-mvttp002";
import { CalendarGridGen } from "./calendar-grid-gen/calendar-grid-gen";
import { EnglishCalendarGrid } from "./english-calendar-grid/english-calendar-grid";
import CJ_MHVAR001, {
  CJ_MHVAR001_HEIGHT,
  CJ_MHVAR001_WIDTH,
} from "./cj-mhvar001/cj-mhvar001";
import CJ_MVVAR001, {
  CJ_MVVAR001_HEIGHT,
  CJ_MVVAR001_WIDTH,
} from "./cj-mvvar001/cj-mvvar001";

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
    desc: `图的印刷尺寸是：155mm * 215mm，按 DPI 300 印刷，像素尺寸至少 ${CJ_MVTTP001_WIDTH} × ${CJ_MVTTP001_HEIGHT}`,
    content: CJ_MVTTP001,
    illustration: "/assets/CJ-MVTTP001_illustration.png",
    tips: [
      // {
      //   content: "产品编号的含义",
      //   link: "https://youmind.site/IOoX8F52nYuTDw",
      // },
    ],
  },
  {
    id: "cj-mvttp002",
    name: "CJ-MVTTP002",
    desc: `图的印刷尺寸是：145mm * 215mm，按 DPI 300 印刷，像素尺寸至少 ${CJ_MVTTP002_WIDTH} × ${CJ_MVTTP002_HEIGHT}`,
    content: CJ_MVTTP002,
    illustration: "/assets/CJ-MVTTP002_illustration.png",
    tips: [
      // {
      //   content: "产品编号的含义",
      //   link: "https://youmind.site/IOoX8F52nYuTDw",
      // },
    ],
  },
  {
    id: "cj-mhvar001",
    name: "CJ-MHVAR001",
    desc: `图的印刷尺寸是：145mm * 105mm，按 DPI 350 印刷，像素尺寸至少 ${CJ_MHVAR001_WIDTH} × ${CJ_MHVAR001_HEIGHT}，插槽深度 ：8mm，像素尺寸：110`,
    content: CJ_MHVAR001,
    illustration: "/assets/CJ-MHVAR001_illustration.jpg",
    tips: [],
  },
  {
    id: "cj-mvvar001",
    name: "CJ-MVVAR001",
    desc: `图的印刷尺寸是：170mm * 120mm，按 DPI 350 印刷，像素尺寸至少 ${CJ_MVVAR001_WIDTH} × ${CJ_MVVAR001_HEIGHT}，插槽深度 ：10mm，像素尺寸：110`,
    content: CJ_MVVAR001,
    illustration: "/assets/CJ-MVVAR001_illustration.jpg",
    tips: [],
  },
  {
    id: "calendar-grid-gen",
    name: "中文日历网格",
    desc: "生成包含农历、节日、节气的日历网格，支持下载为图片作为素材。如有需要新增的字体，请联系作者提出。免费可商用的字体参考：https://freefonts.space/。",
    content: CalendarGridGen,
  },
  {
    id: "english-calendar-grid",
    name: "英语日历网格",
    desc: "简洁的英语版日历网格生成器，专注于英语环境下的日历展示，支持周日高亮等功能。",
    content: EnglishCalendarGrid,
  },
];

export const useWorks = (): IWork[] => works;
