import { CalendarImage } from "../calendar-gen/calendar-gen";
import { ICJVTCP001Renderer } from "./i-CJ-VTCP001-renderer";

export class CJVTCP001Renderer implements ICJVTCP001Renderer {
  private _bgImage: HTMLImageElement = new Image();
  private _ringImage: HTMLImageElement = new Image();

  constructor(private _images: CalendarImage[]) {}

  private async _init() {
    // const { _images } = this;

    this._bgImage.src = "/assets/CJ-VTCP001-calendar-bg.png";
    this._ringImage.src = "/assets/CJ-VTCP001-calendar-ring.png";

    await Promise.all([
      new Promise(resolve => {
        this._bgImage.onload = resolve;
      }),
      new Promise(resolve => {
        this._ringImage.onload = resolve;
      }),
    ]);

    // console.log(_images);
  }

  private _renderCover() {
    const { _bgImage, _ringImage, _images } = this;

    // const canvas = document.createElement("canvas");
    // canvas.width = _bgImage.width;
    // canvas.height = _bgImage.height;
  }

  async render(): Promise<HTMLCanvasElement[]> {
    await this._init();
    this._renderCover();
    return [];
  }
}
