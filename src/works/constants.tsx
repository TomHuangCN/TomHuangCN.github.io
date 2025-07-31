import CJ_VTCP001 from "./CJ-VTCP001/CJ-VTCP001";
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
      name: "月历 CJ-VTCP001",
      desc: "图的尺寸是：153mm * 225mm",
      content: CJ_VTCP001,
      illustration: "/assets/CJ-VTCP001_illustration.png",
      tips: [
        {
          content: "产品编号的含义",
          link: "https://youmind.site/IOoX8F52nYuTDw",
        },
      ],
    },
  ];
};
