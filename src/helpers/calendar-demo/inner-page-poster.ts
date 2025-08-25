import {
  ImgInfo,
  LayoutConfig,
  calculateRowHeight,
  calculateDrawSizes,
  drawImageWithShadow,
  createCanvasWithBackground,
  bindCanvasClick,
} from "./calendar-poster-utils";

export interface InnerPagePosterConfig extends LayoutConfig {
  marginX: number;
  marginY: number;
  rowGap: number;
  colGap: number;
  rows: number;
}

/**
 * 渲染内页大图（均分布局，严格保持间距，canvas宽度与背景图一致，高度自适应）
 */
export async function renderInnerPage(
  startIndex: number,
  count: number,
  loadedImages: HTMLImageElement[],
  bgImageWidth: number
): Promise<HTMLCanvasElement> {
  if (count === 0) {
    // 空内容直接返回空白canvas
    const emptyCanvas = document.createElement("canvas");
    emptyCanvas.width = bgImageWidth;
    emptyCanvas.height = 400;
    return emptyCanvas;
  }

  // 布局参数
  const config: InnerPagePosterConfig = {
    marginX: 32,
    marginY: 64,
    rowGap: 24,
    colGap: 24,
    rows: 2,
  };

  // 均分两行
  const rowCounts: number[] = [];
  if (count <= 3) {
    rowCounts.push(count, 0);
  } else {
    rowCounts.push(Math.ceil(count / 2), Math.floor(count / 2));
  }

  // 计算每行图片的最大可用宽度
  const canvasWidth = bgImageWidth;
  const row1Count = rowCounts[0];
  const row2Count = rowCounts[1];

  // 获取已加载的图片信息
  const imgInfos: ImgInfo[] = [];

  for (let i = 0; i < count; i++) {
    const img = loadedImages[startIndex + i];
    if (!img) continue;
    imgInfos.push({
      img,
      w: img.naturalWidth || 800,
      h: img.naturalHeight || 600,
    });
  }

  // 计算每行的图片高度
  const row1Imgs = imgInfos.slice(0, row1Count);
  const row2Imgs = imgInfos.slice(row1Count, row1Count + row2Count);
  const row1Height =
    row1Count > 0
      ? calculateRowHeight(row1Imgs, row1Count, canvasWidth, config)
      : 0;
  const row2Height =
    row2Count > 0
      ? calculateRowHeight(row2Imgs, row2Count, canvasWidth, config)
      : 0;

  // 计算canvas高度
  const canvasHeight =
    config.marginY +
    row1Height +
    (row2Count > 0 ? config.rowGap + row2Height : 0) +
    config.marginY;

  // 创建canvas
  const canvas = createCanvasWithBackground(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法获取 canvas 2D 上下文");

  // 绘制每一行
  let imgIdx = 0;
  let y = config.marginY;

  for (let row = 0; row < config.rows; row++) {
    const thisRowCount = rowCounts[row];
    if (thisRowCount === 0) continue;

    const availableWidth =
      canvasWidth - config.marginX * 2 - config.colGap * (thisRowCount - 1);
    const rowImgs = imgInfos.slice(imgIdx, imgIdx + thisRowCount);

    // 计算每张图片的缩放后宽高
    const drawSizes = calculateDrawSizes(rowImgs, thisRowCount, availableWidth);
    let maxH = 0;

    for (let i = 0; i < thisRowCount; i++) {
      const { h } = drawSizes[i];
      if (h > maxH) maxH = h;
    }

    // 计算每张图片的x坐标，保证间距严格
    let x = config.marginX;
    for (let i = 0; i < thisRowCount; i++) {
      const info = rowImgs[i];
      const { w, h } = drawSizes[i];

      // 垂直居中
      const drawY = y + Math.floor((maxH - h) / 2);
      // 水平居中在格子内
      const drawX = x + Math.floor((availableWidth / thisRowCount - w) / 2);

      // 绘制带阴影的图片
      drawImageWithShadow(ctx, info.img, drawX, drawY, w, h);

      x += availableWidth / thisRowCount + config.colGap;
    }

    y += maxH + config.rowGap;
    imgIdx += thisRowCount;
  }

  // 绑定canvas点击事件
  bindCanvasClick(canvas);

  return canvas;
}
