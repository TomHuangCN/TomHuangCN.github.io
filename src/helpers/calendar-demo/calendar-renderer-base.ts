import { perspectiveTransform } from "../../utils/transform";
import { CalendarImage } from "./calendar-demo";
import { ICalendarDemoShowRenderer } from "./calendar-demo-show-renderer";

export interface CalendarRendererConfig {
  bgImagePath: string;
  ringImagePath: string;
  perspectiveImage1Coords: [number, number][];
  perspectiveImage2Coords: [number, number][];
}

export abstract class BaseCalendarRenderer
  implements ICalendarDemoShowRenderer
{
  protected _bgImage: HTMLImageElement = new Image();
  protected _ringImage: HTMLImageElement = new Image();

  constructor(
    protected _images: CalendarImage[],
    protected _config: CalendarRendererConfig
  ) {}

  protected async _init() {
    this._bgImage.src = this._config.bgImagePath;
    this._ringImage.src = this._config.ringImagePath;

    await Promise.all([
      new Promise((resolve, reject) => {
        this._bgImage.onload = resolve;
        this._bgImage.onerror = () => reject(new Error("背景图片加载失败"));
      }),
      new Promise((resolve, reject) => {
        this._ringImage.onload = resolve;
        this._ringImage.onerror = () => reject(new Error("环形图片加载失败"));
      }),
    ]);
  }

  /**
   * 透视渲染一张图片到指定四边形
   */
  protected _drawPerspectiveImage(
    ctx: CanvasRenderingContext2D,
    imgUrl: string,
    dstQuad: [number, number][],
    canvasWidth: number,
    canvasHeight: number
  ) {
    const img = new window.Image();
    img.src = imgUrl;

    if (img.width > 0 && img.height > 0) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(img, 0, 0);

        const srcQuad: [number, number][] = [
          [0, 0],
          [img.width, 0],
          [img.width, img.height],
          [0, img.height],
        ];

        const transformed = perspectiveTransform(
          tempCanvas,
          srcQuad,
          dstQuad,
          canvasWidth,
          canvasHeight
        );
        ctx.drawImage(transformed, 0, 0);
      }
    } else {
      img.onload = () => {
        this._drawPerspectiveImage(
          ctx,
          imgUrl,
          dstQuad,
          canvasWidth,
          canvasHeight
        );
      };
    }
  }

  /**
   * 渲染底部内页图片（大图，顶部间距更大，从一月开始，总共12张），分三行渲染
   * canvas: 传入的画布（已扩展高度）
   * images: 内页图片数组
   * extraHeight: 扩展的底部高度
   */
  protected _drawInnerImages(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    images: CalendarImage[],
    extraHeight: number
  ) {
    // 只取前12张（从一月开始）
    const total = Math.min(images.length, 12);
    if (total === 0) return;

    // 新参数（底部区域更大，每个图更大，间距更小）
    const marginBottom = 16; // 距离底部边距，缩小
    const marginTop = 16; // 距离扩展区顶部的间距，缩小
    const gap = 8; // 图片间横向间距，缩小
    const rowGap = 12; // 行间距，缩小
    const rows = 1;
    const cols = 12;

    // 计算每张图片的最大宽高
    const availableWidth = canvas.width - gap * (cols + 1);
    const availableHeight =
      extraHeight - marginTop - marginBottom - rowGap * (rows - 1);
    const imgWidth = Math.floor(availableWidth / cols);
    const imgHeight = Math.floor(availableHeight / rows);

    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const imgObj = images[i];
      if (!imgObj || !imgObj.url) continue;
      const img = new window.Image();
      img.src = imgObj.url;

      // 计算目标绘制区域
      const x = gap + col * (imgWidth + gap);
      const y =
        canvas.height -
        extraHeight + // 扩展区顶部
        marginTop +
        row * (imgHeight + rowGap);

      // 保持图片比例缩放
      let drawW = imgWidth,
        drawH = imgHeight;
      if (img.width > 0 && img.height > 0) {
        const scale = Math.min(imgWidth / img.width, imgHeight / img.height, 1);
        drawW = Math.round(img.width * scale);
        drawH = Math.round(img.height * scale);
      }

      // 居中对齐
      const drawX = x + Math.floor((imgWidth - drawW) / 2);
      const drawY = y + Math.floor((imgHeight - drawH) / 2);

      // 立即绘制（图片已加载时），否则等图片加载后再绘制
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        img.onload = () => {
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        };
      }
    }
  }

  /**
   * 渲染内页大图（每页6张，分两行渲染，每行图片尽量占满canvas宽度）
   * @param images 最多6张图片
   * @returns HTMLCanvasElement
   */
  /**
   * 渲染内页大图（均分布局，严格保持间距，canvas宽度与_bgImage一致，高度自适应）
   * @param images 最多6张图片
   * @returns HTMLCanvasElement
   */
  protected _renderInnerPage(images: CalendarImage[]): HTMLCanvasElement {
    const { _bgImage } = this;
    const count = images.length;
    if (count === 0) {
      // 空内容直接返回空白canvas
      const emptyCanvas = document.createElement("canvas");
      emptyCanvas.width = _bgImage.width;
      emptyCanvas.height = 400;
      return emptyCanvas;
    }

    // 布局参数
    const marginX = 32; // 左右边距
    const marginY = 64; // 顶部/底部边距
    const rowGap = 24; // 行间距
    const colGap = 24; // 图片间距

    // 均分两行
    const rows = 2;
    const rowCounts: number[] = [];
    if (count <= 3) {
      rowCounts.push(count, 0);
    } else {
      rowCounts.push(Math.ceil(count / 2), Math.floor(count / 2));
    }

    // 计算每行图片的最大可用宽度
    const canvasWidth = _bgImage.width;
    const row1Count = rowCounts[0];
    const row2Count = rowCounts[1];

    // 先假设图片高度一致，计算高度
    // 先加载所有图片，获取原始宽高
    type ImgInfo = { img: HTMLImageElement; w: number; h: number; url: string };
    const imgInfos: ImgInfo[] = [];
    for (let i = 0; i < count; i++) {
      const imgObj = images[i];
      if (!imgObj || !imgObj.url) continue;
      const img = new window.Image();
      img.src = imgObj.url;
      imgInfos.push({ img, w: 0, h: 0, url: imgObj.url });
    }

    // 计算每行的最大高度，使得所有图片均分宽度且保持比例
    // 先假设每行图片高度一样，宽度均分
    function calcRowHeight(rowImgInfos: ImgInfo[], rowCount: number): number {
      if (rowCount === 0) return 0;
      const availableWidth =
        canvasWidth - marginX * 2 - colGap * (rowCount - 1);
      // 先用图片原始宽高比，求出在均分宽度下的最大高度
      let minScale = 1;
      for (let i = 0; i < rowCount; i++) {
        const info = rowImgInfos[i];
        if (!info) continue;
        // 先用图片原始宽高
        info.w = info.img.naturalWidth || 1;
        info.h = info.img.naturalHeight || 1;
        // 计算宽度均分下的缩放比例
        const targetW = availableWidth / rowCount;
        const scale = Math.min(targetW / info.w, 1);
        if (scale < minScale) minScale = scale;
      }
      // 取最小缩放比例，保证所有图片都能放下
      // 但我们还要保证高度不能超过最大高度
      let maxH = 0;
      for (let i = 0; i < rowCount; i++) {
        const info = rowImgInfos[i];
        if (!info) continue;
        const targetW = availableWidth / rowCount;
        const scale = Math.min(targetW / info.w, 1);
        const h = Math.round(info.h * scale);
        if (h > maxH) maxH = h;
      }
      return maxH;
    }

    // 先同步获取图片原始宽高（如果已加载），否则用默认值
    for (let i = 0; i < imgInfos.length; i++) {
      const info = imgInfos[i];
      info.w = info.img.naturalWidth || 800;
      info.h = info.img.naturalHeight || 600;
    }

    // 计算每行的图片高度
    const row1Imgs = imgInfos.slice(0, row1Count);
    const row2Imgs = imgInfos.slice(row1Count, row1Count + row2Count);
    const row1Height = row1Count > 0 ? calcRowHeight(row1Imgs, row1Count) : 0;
    const row2Height = row2Count > 0 ? calcRowHeight(row2Imgs, row2Count) : 0;

    // 计算canvas高度
    const canvasHeight =
      marginY +
      row1Height +
      (row2Count > 0 ? rowGap + row2Height : 0) +
      marginY;

    // 创建canvas
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("无法获取 canvas 2D 上下文");

    // 背景填充为白色
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制每一行
    let imgIdx = 0;
    let y = marginY;
    for (let row = 0; row < rows; row++) {
      const thisRowCount = rowCounts[row];
      if (thisRowCount === 0) continue;
      const availableWidth =
        canvasWidth - marginX * 2 - colGap * (thisRowCount - 1);
      const rowImgs = imgInfos.slice(imgIdx, imgIdx + thisRowCount);

      // 计算每张图片的缩放后宽高
      const drawSizes: { w: number; h: number }[] = [];
      let maxH = 0;
      for (let i = 0; i < thisRowCount; i++) {
        const info = rowImgs[i];
        const targetW = availableWidth / thisRowCount;
        const scale = Math.min(targetW / info.w, 1);
        const w = Math.round(info.w * scale);
        const h = Math.round(info.h * scale);
        drawSizes.push({ w, h });
        if (h > maxH) maxH = h;
      }

      // 计算每张图片的x坐标，保证间距严格
      let x = marginX;
      for (let i = 0; i < thisRowCount; i++) {
        const info = rowImgs[i];
        const { w, h } = drawSizes[i];
        // 垂直居中
        const drawY = y + Math.floor((maxH - h) / 2);
        // 水平居中在格子内
        const drawX = x + Math.floor((availableWidth / thisRowCount - w) / 2);

        // 立即绘制或等图片加载后绘制
        if (info.img.complete && info.img.naturalWidth > 0) {
          ctx.drawImage(info.img, drawX, drawY, w, h);
        } else {
          info.img.onload = () => {
            ctx.drawImage(info.img, drawX, drawY, w, h);
          };
        }
        x += availableWidth / thisRowCount + colGap;
      }
      y += maxH + rowGap;
      imgIdx += thisRowCount;
    }

    // 绑定canvas点击事件
    this._bindCanvasClick(canvas);

    return canvas;
  }

  /**
   * 绑定canvas点击事件，输出像素坐标
   */
  protected _bindCanvasClick(canvas: HTMLCanvasElement) {
    canvas.onclick = function (e) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.round(
        (e.clientX - rect.left) * (canvas.width / rect.width)
      );
      const y = Math.round(
        (e.clientY - rect.top) * (canvas.height / rect.height)
      );
      console.log("点击像素坐标：", { x, y });
    };
  }

  protected _renderCover() {
    const { _bgImage, _ringImage, _images, _config } = this;

    // 扩展底部空白区域高度（更大）
    const extraHeight = 160; // 比原来更高，给大图和更大顶部间距

    // 创建更高的canvas
    const canvas = document.createElement("canvas");
    canvas.width = _bgImage.width;
    canvas.height = _bgImage.height + extraHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("无法获取 canvas 2D 上下文");
    }

    // 先绘制背景图（在顶部）
    ctx.drawImage(_bgImage, 0, 0);

    // 透视渲染 _images[0]
    if (_images && _images[0] && _images[0].url) {
      this._drawPerspectiveImage(
        ctx,
        _images[0].url,
        _config.perspectiveImage1Coords,
        _bgImage.width,
        _bgImage.height
      );
    }

    // 透视渲染 _images[1] 到指定坐标
    if (_images && _images[1] && _images[1].url) {
      this._drawPerspectiveImage(
        ctx,
        _images[1].url,
        _config.perspectiveImage2Coords,
        _bgImage.width,
        _bgImage.height
      );
    }

    // 绘制环形图
    ctx.drawImage(_ringImage, 0, 0);

    // 渲染底部内页图片（在扩展区域，3行大图，从一月开始，最多12张）
    const innerImages: CalendarImage[] = _images.slice(1, 13); // 只取12张
    this._drawInnerImages(ctx, canvas, innerImages, extraHeight);

    // 绑定canvas点击事件
    this._bindCanvasClick(canvas);

    return canvas;
  }

  async render(): Promise<HTMLCanvasElement[]> {
    await this._init();
    const cover = this._renderCover();

    if (!cover) {
      throw new Error("渲染封面时发生错误，canvas 未生成。");
    }

    // 渲染内页大图（_images[1]~_images[12]，共12张，分2页，每页6张）
    const innerImages: CalendarImage[] = this._images.slice(1, 13); // [1]~[12]
    const page1Images = innerImages.slice(0, 6);
    const page2Images = innerImages.slice(6, 12);

    const innerPage1 = this._renderInnerPage(page1Images);
    const innerPage2 = this._renderInnerPage(page2Images);

    return [cover, innerPage1, innerPage2];
  }
}
