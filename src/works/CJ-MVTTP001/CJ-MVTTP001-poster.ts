import type { PageImage } from "../../helpers/calendar-demo/types";
import {
  BaseCalendarPoster,
  CalendarPosterConfig,
} from "../../helpers/calendar-demo/calendar-poster-base";

export class CJMVTTP001Poster extends BaseCalendarPoster {
  constructor(images: PageImage[]) {
    const config: CalendarPosterConfig = {
      bgImagePath: "/assets/CJ-MVTTP001-calendar-bg.e2df6d74.png",
      ringImagePath: "/assets/CJ-MVTTP001-calendar-ring.a5505a05.png",
      perspectiveImage1Coords: [
        [190, 203], // 左上
        [539, 185], // 右上
        [483, 738], // 右下
        [135, 698], // 左下
      ],
      perspectiveImage2Coords: [
        [650, 220], // 左上
        [960, 212], // 右上
        [910, 708], // 右下
        [600, 669], // 左下
      ],
    };
    super(images, config);
  }
}
