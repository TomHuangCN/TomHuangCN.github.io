import CJ_MVTCP001 from "./CJ-MVTCP001/CJ-MVTCP001";
import CJ_MVTCP002 from "./CJ-MVTCP002/CJ-MVTCP002";
import React from "react";

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

export const useWorks = (): IWork[] => {
  return [
    {
      id: "monthly-calendar-gen",
      name: "月历 CJ-MVTCP001",
      desc: "图的印刷尺寸是：153mm * 225mm，按 DPI 300 印刷，像素尺寸至少 1807 × 2657",
      content: CJ_MVTCP001,
      illustration: "/assets/CJ-MVTCP001_illustration.png",
      tips: [
        {
          content: "产品编号的含义",
          link: "https://youmind.site/IOoX8F52nYuTDw",
        },
      ],
    },
    {
      id: "monthly-calendar-gen-002",
      name: "月历 CJ-MVTCP002",
      desc: "图的印刷尺寸是：145mm * 215mm，按 DPI 300 印刷，像素尺寸至少 1713 × 2540",
      content: CJ_MVTCP002,
      illustration: "/assets/CJ-MVTCP002_illustration.png",
      tips: [
        {
          content: "产品编号的含义",
          link: "https://youmind.site/IOoX8F52nYuTDw",
        },
      ],
    },
  ];
};
