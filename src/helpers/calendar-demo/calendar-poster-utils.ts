import { perspectiveTransform } from "../../utils/transform";

export interface ImgInfo {
  img: HTMLImageElement;
  w: number;
  h: number;
}

export interface LayoutConfig {
  marginX: number;
  marginY: number;
  rowGap: number;
  colGap: number;
  rows: number;
}

export interface DrawSize {
  w: number;
  h: number;
}

/**
 * 透视渲染一张图片到指定四边形
 */
export function drawPerspectiveImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dstQuad: [number, number][],
  canvasWidth: number,
  canvasHeight: number
): void {
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

    // 添加阴影效果
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.drawImage(transformed, 0, 0);
    ctx.restore();
  }
}

/**
 * 异步透视渲染一张图片到指定四边形
 */
export async function drawPerspectiveImageAsync(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dstQuad: [number, number][],
  canvasWidth: number,
  canvasHeight: number
): Promise<void> {
  drawPerspectiveImage(ctx, img, dstQuad, canvasWidth, canvasHeight);
}

/**
 * 计算行高度，使得所有图片均分宽度且保持比例
 */
export function calculateRowHeight(
  rowImgInfos: ImgInfo[],
  rowCount: number,
  canvasWidth: number,
  config: LayoutConfig
): number {
  if (rowCount === 0) return 0;

  const availableWidth =
    canvasWidth - config.marginX * 2 - config.colGap * (rowCount - 1);
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

/**
 * 计算每张图片的绘制尺寸
 */
export function calculateDrawSizes(
  rowImgs: ImgInfo[],
  rowCount: number,
  availableWidth: number
): DrawSize[] {
  const drawSizes: DrawSize[] = [];

  for (let i = 0; i < rowCount; i++) {
    const info = rowImgs[i];
    const targetW = availableWidth / rowCount;
    const scale = Math.min(targetW / info.w, 1);
    const w = Math.round(info.w * scale);
    const h = Math.round(info.h * scale);
    drawSizes.push({ w, h });
  }

  return drawSizes;
}

/**
 * 绘制带阴影的图片
 */
export function drawImageWithShadow(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.drawImage(img, x, y, width, height);
  ctx.restore();
}

/**
 * 绑定canvas点击事件，输出像素坐标
 */
export function bindCanvasClick(canvas: HTMLCanvasElement): void {
  canvas.onclick = function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round(
      (e.clientY - rect.top) * (canvas.height / rect.height)
    );
    console.log("点击像素坐标：", { x, y });
  };
}

/**
 * 创建空白canvas
 */
export function createEmptyCanvas(
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * 创建带白色背景的canvas
 */
export function createCanvasWithBackground(
  width: number,
  height: number,
  backgroundColor: string = "#fff"
): HTMLCanvasElement {
  const canvas = createEmptyCanvas(width, height);
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return canvas;
}
