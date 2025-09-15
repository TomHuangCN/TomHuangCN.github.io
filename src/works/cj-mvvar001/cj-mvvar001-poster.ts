import type { PageImage } from "../../helpers/calendar-demo/types";
import {
  BaseCalendarPoster,
  CalendarPosterConfig,
} from "../../helpers/calendar-demo/calendar-poster-base";

export class CJMVVAR001Poster extends BaseCalendarPoster {
  constructor(images: PageImage[]) {
    const config: CalendarPosterConfig = {
      bgImagePath: "/assets/CJ-MVVAR001-calendar-bg.74aac459.jpg",
      ringImagePath: "/assets/CJ-MVVAR001-calendar-ring.5780dc0f.png",
      perspectiveImage1Coords: [
        [180, 348],
        [760, 334],
        [819, 1160],
        [239, 1225],
      ],
      perspectiveImage2Coords: [
        [965, 337], // 左上
        [1548, 352], // 右上
        [1489, 1231], // 右下
        [904, 1166], // 左下
      ],
    };
    super(images, config);
  }
}
