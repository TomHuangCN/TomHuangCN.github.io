import { CalendarPicture } from "./calendar-demo";
import { ICalendarDemoShowRenderer } from "./calendar-demo-show-renderer";
import { loadAllImages } from "./image-loader";
import { drawPerspectiveImageAsync } from "./calendar-poster-utils";
import { renderInnerPage } from "./inner-page-poster";
import { drawBottomInnerImages } from "./bottom-images-poster";
import { createEmptyCanvas, bindCanvasClick } from "./calendar-poster-utils";

export interface CalendarPosterConfig {
  bgImagePath: string;
  ringImagePath: string;
  perspectiveImage1Coords: [number, number][];
  perspectiveImage2Coords: [number, number][];
}

export abstract class BaseCalendarPoster implements ICalendarDemoShowRenderer {
  protected _bgImage!: HTMLImageElement;
  protected _ringImage!: HTMLImageElement;
  protected _loadedImages: HTMLImageElement[] = [];

  constructor(
    protected _images: CalendarPicture[],
    protected _config: CalendarPosterConfig
  ) {}

  protected async _init() {
    // 使用工具函数加载所有图片
    const { bgImage, ringImage, loadedImages } = await loadAllImages(
      this._images,
      this._config.bgImagePath,
      this._config.ringImagePath
    );

    this._bgImage = bgImage;
    this._ringImage = ringImage;
    this._loadedImages = loadedImages;
  }

  protected async _renderCover(): Promise<HTMLCanvasElement> {
    const { _bgImage, _ringImage, _images, _config } = this;

    // 扩展底部空白区域高度（更大）
    const extraHeight = 160; // 比原来更高，给大图和更大顶部间距

    // 创建更高的canvas
    const canvas = createEmptyCanvas(
      _bgImage.width,
      _bgImage.height + extraHeight
    );

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("无法获取 canvas 2D 上下文");
    }

    // 先绘制背景图（在顶部）
    ctx.drawImage(_bgImage, 0, 0);

    // 等待所有透视图片绘制完成
    const perspectivePromises: Promise<void>[] = [];

    // 透视渲染 _images[0]
    if (_images && _images[0] && _images[0].url) {
      const promise1 = drawPerspectiveImageAsync(
        ctx,
        this._loadedImages[0],
        _config.perspectiveImage1Coords,
        _bgImage.width,
        _bgImage.height
      );
      perspectivePromises.push(promise1);
    }

    // 透视渲染 _images[1] 到指定坐标
    if (_images && _images[1] && _images[1].url) {
      const promise2 = drawPerspectiveImageAsync(
        ctx,
        this._loadedImages[1],
        _config.perspectiveImage2Coords,
        _bgImage.width,
        _bgImage.height
      );
      perspectivePromises.push(promise2);
    }

    // 等待所有透视图片绘制完成
    await Promise.all(perspectivePromises);

    // 绘制环形图（确保在所有透视图片之后绘制）
    ctx.drawImage(_ringImage, 0, 0);

    // 渲染底部内页图片（在扩展区域，3行大图，从一月开始，最多12张）
    drawBottomInnerImages(ctx, canvas, this._loadedImages, 1, extraHeight);

    // 绑定canvas点击事件
    bindCanvasClick(canvas);

    return canvas;
  }

  async render(): Promise<HTMLCanvasElement[]> {
    await this._init();
    const cover = await this._renderCover();

    if (!cover) {
      throw new Error("渲染封面时发生错误，canvas 未生成。");
    }

    // 渲染内页大图（_images[1]~_images[12]，共12张，分2页，每页6张）
    const innerPage1 = await renderInnerPage(
      1,
      6,
      this._loadedImages,
      this._bgImage.width
    );
    const innerPage2 = await renderInnerPage(
      7,
      6,
      this._loadedImages,
      this._bgImage.width
    );

    return [cover, innerPage1, innerPage2];
  }
}
