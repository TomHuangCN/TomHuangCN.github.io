import { CalendarImage } from "../../helps/calendar-demo/calendar-demo";
import {
  BaseCalendarRenderer,
  CalendarRendererConfig,
} from "../../helps/calendar-demo/calendar-renderer-base";

export class CJMVTTP001Renderer extends BaseCalendarRenderer {
  constructor(images: CalendarImage[]) {
    const config: CalendarRendererConfig = {
      bgImagePath: "/assets/CJ-MVTTP001-calendar-bg.png",
      ringImagePath: "/assets/CJ-MVTTP001-calendar-ring.png",
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
