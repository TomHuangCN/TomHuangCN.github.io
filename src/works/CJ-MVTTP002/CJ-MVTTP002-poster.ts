import { CalendarImage } from "../../helpers/calendar-demo/calendar-demo";
import {
  BaseCalendarPoster,
  CalendarPosterConfig,
} from "../../helpers/calendar-demo/calendar-poster-base";

export class CJMVTTP002Poster extends BaseCalendarPoster {
  constructor(images: CalendarImage[]) {
    const config: CalendarPosterConfig = {
      bgImagePath: "./assets/CJ-MVTTP002-calendar-bg.png",
      ringImagePath: "./assets/CJ-MVTTP002-calendar-ring.png",
      perspectiveImage1Coords: [
        [239, 154], // 左上
        [531, 136], // 右上
        [487, 672], // 右下
        [180, 638], // 左下
      ],
      perspectiveImage2Coords: [
        [678, 180], // 左上
        [953, 162], // 右上
        [910, 667], // 右下
        [637, 629], // 左下
      ],
    };
    super(images, config);
  }
}
