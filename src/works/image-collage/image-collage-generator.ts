/**
 * 图片拼接生成器
 * 负责将多张图片拼接成一张图，并提取合适的背景色
 * 使用改进的布局算法，支持不同尺寸图片的最佳排列
 */

import { ColorUtils, ColorOption, ImageWithSize } from "./color-utils";

interface CollageResult {
  canvas: HTMLCanvasElement;
  backgroundColor: string;
  recommendedColors: ColorOption[];
  images: ImageWithSize[];
  layout: ImagePosition[];
}

interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ImageCollageGenerator {
  private readonly padding = 20; // 图片间距
  private readonly canvasPadding = 40; // 画布外边距
  private readonly maxCanvasWidth = 2400; // 最大画布宽度

  async generate(imageUrls: string[]): Promise<CollageResult> {
    if (imageUrls.length === 0) {
      throw new Error("至少需要一张图片");
    }

    console.log("开始加载图片，数量:", imageUrls.length);
    // 加载所有图片
    const images = await this.loadImages(imageUrls);
    console.log("图片加载完成，实际加载数量:", images.length);

    // 先提取背景色（在布局前，这样可以基于原始图片）
    console.log("开始提取背景色");
    const backgroundColor = ColorUtils.extractBackgroundColor(images);
    const recommendedColors = ColorUtils.extractRecommendedColors(images);
    console.log("背景色提取完成:", backgroundColor);
    console.log("推荐背景色:", recommendedColors);

    // 计算最佳布局（使用改进的算法）
    console.log("开始计算布局");
    const layout = this.calculateOptimalLayout(images);
    console.log("布局计算完成，位置数量:", layout.length);

    // 创建画布并绘制（背景色在最底层）
    console.log("开始创建画布并绘制");
    const canvas = this.createAndDrawCanvas(images, layout, backgroundColor);
    console.log("画布创建完成，尺寸:", canvas.width, "x", canvas.height);

    return { canvas, backgroundColor, recommendedColors, images, layout };
  }

  /**
   * 重新渲染canvas，使用新的背景色
   */
  createCanvasWithNewBackground(
    images: ImageWithSize[],
    layout: ImagePosition[],
    newBackgroundColor: string
  ): HTMLCanvasElement {
    console.log("重新渲染canvas，新背景色:", newBackgroundColor);
    return this.createAndDrawCanvas(images, layout, newBackgroundColor);
  }

  /**
   * 加载所有图片
   */
  private async loadImages(urls: string[]): Promise<ImageWithSize[]> {
    const promises = urls.map(url => this.loadImage(url));
    return Promise.all(promises);
  }

  /**
   * 加载单张图片
   */
  private loadImage(url: string): Promise<ImageWithSize> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        console.log(`图片加载成功: ${url}, 尺寸: ${img.width}x${img.height}`);
        resolve({
          img,
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
        });
      };

      img.onerror = error => {
        console.error(`图片加载失败: ${url}`, error);
        reject(new Error(`图片加载失败: ${url}`));
      };

      img.src = url;
    });
  }

  /**
   * 计算最佳布局
   */
  private calculateOptimalLayout(images: ImageWithSize[]): ImagePosition[] {
    const count = images.length;

    if (count === 13) {
      return this.calculateCalendarLayout(images);
    }

    // 通用网格布局
    return this.calculateGridLayout(images);
  }

  /**
   * 13张图片的特殊布局（日历风格）
   */
  private calculateCalendarLayout(images: ImageWithSize[]): ImagePosition[] {
    const positions: ImagePosition[] = [];
    const availableWidth = this.maxCanvasWidth - this.canvasPadding * 2;
    const gap = this.padding;

    // Second row (4x2 grid): 4 columns, 3 gaps
    const grid4x2ImageWidth = Math.floor((availableWidth - gap * 3) / 4);
    const grid4x2ImageHeight = Math.floor(grid4x2ImageWidth * 1.3); // Portrait ratio

    // First row (main image + 2x2 grid): needs to match second row width
    // 2x2 grid: 2 columns, 1 gap
    const grid2x2ImageWidth = grid4x2ImageWidth; // Use same small image width
    // Simplified: main image width = 2 small image widths + 1 gap (consistent with 2x2 grid's 2 columns)
    const mainImageWidth = grid2x2ImageWidth * 2 + gap;

    // Main image (first image) dimensions, height to match 2x2 grid
    const firstImage = images[0];
    const mainImageHeight = grid4x2ImageHeight * 2 + gap; // Total height of 2x2 grid

    const mainScale = Math.min(
      mainImageWidth / firstImage.width,
      mainImageHeight / firstImage.height
    );
    const mainScaledWidth = firstImage.width * mainScale;
    const mainScaledHeight = firstImage.height * mainScale;

    // First image (main image) - left aligned
    positions.push({
      x: this.canvasPadding + 16,
      y: this.canvasPadding,
      width: mainScaledWidth,
      height: mainScaledHeight,
    });

    // Images 2-5 (2x2 grid) - right aligned
    const grid2x2StartX = this.canvasPadding + mainImageWidth + gap;
    const grid2x2StartY = this.canvasPadding;

    for (let i = 1; i <= 4; i++) {
      const img = images[i];
      const index = i - 1;
      const row = Math.floor(index / 2); // 0 or 1
      const col = index % 2; // 0 or 1

      // Use unified dimensions, image centered within grid
      const scale = Math.min(
        grid2x2ImageWidth / img.width,
        grid4x2ImageHeight / img.height
      );
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      const x = grid2x2StartX + col * (grid2x2ImageWidth + gap);
      const y = grid2x2StartY + row * (grid4x2ImageHeight + gap);

      positions.push({
        x: x + (grid2x2ImageWidth - scaledWidth) / 2,
        y: y + (grid4x2ImageHeight - scaledHeight) / 2,
        width: scaledWidth,
        height: scaledHeight,
      });
    }

    // Images 6-13 (4x2 grid) - use same dimensions
    const grid4x2StartY = this.canvasPadding + mainImageHeight + gap * 2; // Increased row spacing

    for (let i = 5; i < images.length; i++) {
      const img = images[i];
      const index = i - 5; // Index within the 8 images
      const row = Math.floor(index / 4); // 0 or 1
      const col = index % 4; // 0,1,2,3

      // Use unified dimensions, image centered within grid
      const scale = Math.min(
        grid4x2ImageWidth / img.width,
        grid4x2ImageHeight / img.height
      );
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      const x = this.canvasPadding + col * (grid4x2ImageWidth + gap);
      const y = grid4x2StartY + row * (grid4x2ImageHeight + gap);

      positions.push({
        x: x + (grid4x2ImageWidth - scaledWidth) / 2,
        y: y + (grid4x2ImageHeight - scaledHeight) / 2,
        width: scaledWidth,
        height: scaledHeight,
      });
    }

    return positions;
  }

  /**
   * 通用网格布局
   */
  private calculateGridLayout(images: ImageWithSize[]): ImagePosition[] {
    const positions: ImagePosition[] = [];
    const count = images.length;
    const availableWidth = this.maxCanvasWidth - this.canvasPadding * 2;
    const gap = this.padding;

    // 计算最佳列数
    const cols = Math.ceil(Math.sqrt(count));

    // 计算每个网格的尺寸
    const cellWidth = Math.floor((availableWidth - gap * (cols - 1)) / cols);
    const cellHeight = Math.floor(cellWidth * 1.2); // 稍微高一点的比例

    images.forEach((img, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      // 计算缩放比例，保持图片比例
      const scale = Math.min(cellWidth / img.width, cellHeight / img.height);

      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      // 计算位置（居中显示）
      const x =
        this.canvasPadding +
        col * (cellWidth + gap) +
        (cellWidth - scaledWidth) / 2;
      const y =
        this.canvasPadding +
        row * (cellHeight + gap) +
        (cellHeight - scaledHeight) / 2;

      positions.push({
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
    });

    return positions;
  }

  /**
   * 创建画布并绘制图片
   */
  private createAndDrawCanvas(
    images: ImageWithSize[],
    positions: ImagePosition[],
    backgroundColor: string
  ): HTMLCanvasElement {
    console.log(
      "开始创建画布，图片数量:",
      images.length,
      "位置数量:",
      positions.length
    );
    // Calculate total canvas dimensions
    let maxX = 0;
    let maxY = 0;
    positions.forEach((pos, index) => {
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
      console.log(
        `位置${index}: (${pos.x}, ${pos.y}) 尺寸: ${pos.width}x${pos.height}`
      );
    });

    const canvasWidth = maxX + this.canvasPadding;
    const canvasHeight = maxY + this.canvasPadding;
    console.log("画布尺寸:", canvasWidth, "x", canvasHeight);

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("无法获取canvas上下文");
    }

    // Step 1: Fill background color (bottom layer)
    console.log("填充背景色:", backgroundColor);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Step 2: Draw all images
    console.log(
      "开始绘制图片，images数组长度:",
      images.length,
      "positions数组长度:",
      positions.length
    );
    images.forEach((img, index) => {
      console.log(`准备绘制第${index}张图片`);

      const pos = positions[index];
      if (!pos) {
        console.error(`位置${index}不存在`);
        return;
      }

      console.log(
        `绘制图片${index}:`,
        img.img.src,
        "位置:",
        pos.x,
        pos.y,
        "尺寸:",
        pos.width,
        pos.height
      );

      try {
        // Add shadow effect for depth - 图一（主图）使用更明显的阴影
        if (index === 0) {
          // 主图使用更明显的阴影效果
          ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
          ctx.shadowBlur = 30;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 6;
        } else {
          // 其他图片使用标准阴影效果
          ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
        }

        // Draw image
        ctx.drawImage(img.img, pos.x, pos.y, pos.width, pos.height);
        console.log(`图片${index}绘制成功`);

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } catch (error) {
        console.error(`绘制图片${index}失败:`, error);
      }
    });

    console.log("画布绘制完成");
    return canvas;
  }
}
