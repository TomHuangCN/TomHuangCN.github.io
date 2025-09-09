import type { PageImage } from "../../helpers/calendar-demo/types";
import {
  BaseCalendarPoster,
  CalendarPosterConfig,
} from "../../helpers/calendar-demo/calendar-poster-base";

export class CJMVVAR001Poster extends BaseCalendarPoster {
  constructor(images: PageImage[]) {
    const config: CalendarPosterConfig = {
      bgImagePath: "/assets/CJ-MVVAR001-calendar-bg.jpg",
      ringImagePath: "/assets/CJ-MVVAR001-calendar-ring.png",
      perspectiveImage1Coords: [
        [150, 212],
        [469, 200],
        [509, 660],
        [193, 713],
      ],
      perspectiveImage2Coords: [
        [629, 191], // 左上
        [941, 202], // 右上
        [904, 699], // 右下
        [593, 659], // 左下
      ],
    };
    super(images, config);
  }
}
