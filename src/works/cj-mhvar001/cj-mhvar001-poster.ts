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
        [94, 396], // 左上
        [1560, 284], // 右上
        [1663, 1278], // 右下
        [247, 1512], // 左下
      ],
    };
    super(images, config);
  }
}
