import { CalendarImage } from "../../helps/calendar-demo/calendar-demo";
import {
  BaseCalendarRenderer,
  CalendarRendererConfig,
} from "../../helps/calendar-demo/calendar-renderer-base";

export class CJMVTCP002Renderer extends BaseCalendarRenderer {
  constructor(images: CalendarImage[]) {
    const config: CalendarRendererConfig = {
      bgImagePath: "/assets/CJ-MVTCP002-calendar-bg.png",
      ringImagePath: "/assets/CJ-MVTCP002-calendar-ring.png",
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
