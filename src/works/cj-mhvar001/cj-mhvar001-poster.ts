import type { PageImage } from "../../helpers/calendar-demo/types";
import {
  BaseCalendarPoster,
  CalendarPosterConfig,
} from "../../helpers/calendar-demo/calendar-poster-base";

export class CJMHVAR001Poster extends BaseCalendarPoster {
  constructor(images: PageImage[]) {
    const config: CalendarPosterConfig = {
      bgImagePath: "/assets/CJ-MHVAR001-calendar-bg.jpg",
      ringImagePath: "/assets/CJ-MHVAR001-calendar-ring.png",
      perspectiveImage1Coords: [
        [40, 392], // 左上（点击像素坐标：{x: 34, y: 397}）
        [489, 326], // 右上（点击像素坐标：{x: 489, y: 323}）
        [541, 638], // 右下（点击像素坐标：{x: 541, y: 638}）
        [95, 737], // 左下（点击像素坐标：{x: 95, y: 737}）
      ],
      perspectiveImage2Coords: [
        [572, 326], // 左上（点击像素坐标：{x: 572, y: 328}）
        [1035, 343], // 右上（点击像素坐标：{x: 1035, y: 343}）
        [1018, 695], // 右下（点击像素坐标：{x: 1018, y: 695}）
        [554, 647], // 左下（点击像素坐标：{x: 554, y: 645}）
      ],
    };
    super(images, config);
  }
}
