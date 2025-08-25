import { drawImageWithShadow } from "./calendar-poster-utils";

export interface BottomImagesPosterConfig {
  marginBottom: number;
  marginTop: number;
  gap: number;
  rowGap: number;
  rows: number;
  cols: number;
}

/**
 * 渲染底部内页图片（大图，顶部间距更大，从一月开始，总共12张），分三行渲染
 */
export function drawBottomInnerImages(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  loadedImages: HTMLImageElement[],
  startIndex: number,
  extraHeight: number
): void {
  // 只取前12张（从一月开始）
  const total = Math.min(12, loadedImages.length - startIndex);
  if (total === 0) return;

  // 配置参数（底部区域更大，每个图更大，间距更小）
  const config: BottomImagesPosterConfig = {
    marginBottom: 16, // 距离底部边距，缩小
    marginTop: 16, // 距离扩展区顶部的间距，缩小
    gap: 8, // 图片间横向间距，缩小
    rowGap: 12, // 行间距，缩小
    rows: 1,
    cols: 12
  };

  // 计算每张图片的最大宽高
  const availableWidth = canvas.width - config.gap * (config.cols + 1);
  const availableHeight =
    extraHeight - config.marginTop - config.marginBottom - config.rowGap * (config.rows - 1);
  const imgWidth = Math.floor(availableWidth / config.cols);
  const imgHeight = Math.floor(availableHeight / config.rows);

  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / config.cols);
    const col = i % config.cols;
    const img = loadedImages[startIndex + i];
    if (!img) continue;

    // 计算目标绘制区域
    const x = config.gap + col * (imgWidth + config.gap);
    const y =
      canvas.height -
      extraHeight + // 扩展区顶部
      config.marginTop +
      row * (imgHeight + config.rowGap);

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

    // 绘制带阴影的图片
    drawImageWithShadow(ctx, img, drawX, drawY, drawW, drawH);
  }
}
