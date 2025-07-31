import { perspectiveTransform } from "../../util/transform";
import { CalendarImage } from "../calendar-demo/calendar-demo";
import { ICJVTCP001Renderer } from "./i-CJ-VTCP001-renderer";

export class CJVTCP001Renderer implements ICJVTCP001Renderer {
  private _bgImage: HTMLImageElement = new Image();
  private _ringImage: HTMLImageElement = new Image();

  constructor(private _images: CalendarImage[]) {}

  private async _init() {
    this._bgImage.src = "/assets/CJ-VTCP001-calendar-bg.png";
    this._ringImage.src = "/assets/CJ-VTCP001-calendar-ring.png";

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
  private _drawPerspectiveImage(
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
  private _drawInnerImages(
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
  private _renderInnerPage(images: CalendarImage[]): HTMLCanvasElement {
    const { _bgImage } = this;
    const canvas = document.createElement("canvas");
    canvas.width = _bgImage.width;
    canvas.height = _bgImage.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("无法获取 canvas 2D 上下文");

    // 背景填充为白色
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 分两行渲染
    const count = images.length;
    const rows = 2;
    // 计算每行图片数量
    const row1Count = Math.ceil(count / 2);
    const row2Count = count - row1Count;

    // 布局参数
    const marginX = 32; // 左右边距
    const marginY = 64; // 顶部/底部边距
    const rowGap = 24; // 行间距
    const gap = 24; // 图片间距

    // 计算每行的高度
    const availableHeight = canvas.height - marginY * 2 - rowGap;
    const imgHeight = Math.floor(availableHeight / rows);

    // 第一行
    if (row1Count > 0) {
      const availableWidth1 =
        canvas.width - marginX * 2 - gap * (row1Count - 1);
      const imgWidth1 = Math.floor(availableWidth1 / row1Count);
      for (let i = 0; i < row1Count; i++) {
        const imgObj = images[i];
        if (!imgObj || !imgObj.url) continue;
        const img = new window.Image();
        img.src = imgObj.url;

        // 保持图片比例缩放
        let drawW = imgWidth1,
          drawH = imgHeight;
        if (img.width > 0 && img.height > 0) {
          const scale = Math.min(
            imgWidth1 / img.width,
            imgHeight / img.height,
            1
          );
          drawW = Math.round(img.width * scale);
          drawH = Math.round(img.height * scale);
        }

        // 计算目标绘制区域
        const x =
          marginX + i * (imgWidth1 + gap) + Math.floor((imgWidth1 - drawW) / 2);
        const y = marginY + Math.floor((imgHeight - drawH) / 2);

        // 立即绘制（图片已加载时），否则等图片加载后再绘制
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, x, y, drawW, drawH);
        } else {
          img.onload = () => {
            ctx.drawImage(img, x, y, drawW, drawH);
          };
        }
      }
    }

    // 第二行
    if (row2Count > 0) {
      const availableWidth2 =
        canvas.width - marginX * 2 - gap * (row2Count - 1);
      const imgWidth2 = Math.floor(availableWidth2 / row2Count);
      for (let i = 0; i < row2Count; i++) {
        const imgObj = images[row1Count + i];
        if (!imgObj || !imgObj.url) continue;
        const img = new window.Image();
        img.src = imgObj.url;

        // 保持图片比例缩放
        let drawW = imgWidth2,
          drawH = imgHeight;
        if (img.width > 0 && img.height > 0) {
          const scale = Math.min(
            imgWidth2 / img.width,
            imgHeight / img.height,
            1
          );
          drawW = Math.round(img.width * scale);
          drawH = Math.round(img.height * scale);
        }

        // 计算目标绘制区域
        const x =
          marginX + i * (imgWidth2 + gap) + Math.floor((imgWidth2 - drawW) / 2);
        const y =
          marginY + imgHeight + rowGap + Math.floor((imgHeight - drawH) / 2);

        // 立即绘制（图片已加载时），否则等图片加载后再绘制
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, x, y, drawW, drawH);
        } else {
          img.onload = () => {
            ctx.drawImage(img, x, y, drawW, drawH);
          };
        }
      }
    }

    // 绑定canvas点击事件
    this._bindCanvasClick(canvas);

    return canvas;
  }

  /**
   * 绑定canvas点击事件，输出像素坐标
   */
  private _bindCanvasClick(canvas: HTMLCanvasElement) {
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

  private _renderCover() {
    const { _bgImage, _ringImage, _images } = this;

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
        [
          [190, 203], // 左上
          [539, 187], // 右上
          [483, 738], // 右下
          [135, 698], // 左下
        ],
        _bgImage.width,
        _bgImage.height
      );
    }

    // 透视渲染 _images[1] 到指定坐标
    if (_images && _images[1] && _images[1].url) {
      this._drawPerspectiveImage(
        ctx,
        _images[1].url,
        [
          [650, 220], // 左上
          [960, 214], // 右上
          [910, 708], // 右下
          [600, 669], // 左下
        ],
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
