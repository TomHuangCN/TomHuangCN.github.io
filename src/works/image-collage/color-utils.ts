/**
 * 颜色工具类
 * 负责图片颜色分析、背景色提取、色彩理论计算等功能
 */

export interface ColorOption {
  color: string;
  style: string;
  description: string;
}

export interface ImageWithSize {
  img: HTMLImageElement;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export class ColorUtils {
  /**
   * 从图片中提取主色调作为背景色 - 确保为浅色
   * 使用颜色量化算法
   */
  static extractBackgroundColor(images: ImageWithSize[]): string {
    const allColors: number[] = [];

    // 从每张图片采样颜色
    images.forEach(imageData => {
      const colors = this.sampleImageColors(imageData.img);
      allColors.push(...colors);
    });

    // 如果没有采样到颜色，返回默认浅色
    if (allColors.length === 0) {
      return "rgb(248, 249, 250)"; // 默认浅灰色
    }

    // 对采样的颜色进行聚类，找出主色调
    const dominantColor = this.findDominantColor(allColors);

    // 将主色调调淡作为背景色（提高亮度，降低饱和度）
    const backgroundColor = this.adjustColorForBackground(
      dominantColor,
      0.9,
      0.2
    );

    // 确保背景色是浅色的
    const rgb = this.parseColor(backgroundColor);
    if (rgb && this.isDarkColor(backgroundColor)) {
      return this.makeColorLight(rgb.r, rgb.g, rgb.b);
    }

    return backgroundColor;
  }

  /**
   * 提取3个精选推荐背景色 - 完全基于图片采样，无写死颜色
   */
  static extractRecommendedColors(images: ImageWithSize[]): ColorOption[] {
    const allColors: number[] = [];

    // 从每张图片采样颜色
    images.forEach(imageData => {
      const colors = this.sampleImageColors(imageData.img);
      allColors.push(...colors);
    });

    // 如果没有采样到颜色，返回空数组
    if (allColors.length === 0) {
      return [];
    }

    // 找出前3个主要颜色
    const topColors = this.findTopColors(allColors, 3);

    const candidateColors: ColorOption[] = [];

    if (topColors.length > 0) {
      const dominantColor = topColors[0];

      // 候选颜色1：主色调浅色版 - 基于图片主色的浅色背景
      candidateColors.push({
        color: this.adjustColorForBackground(dominantColor, 0.92, 0.15),
        style: "和谐统一",
        description: `基于图片主色调的浅色版本，与图片内容完美融合`,
      });

      // 候选颜色2：互补色浅色版 - 创造视觉层次
      const complementaryColor = this.getComplementaryColor(dominantColor);
      candidateColors.push({
        color: this.adjustColorForBackground(complementaryColor, 0.94, 0.12),
        style: "对比鲜明",
        description: `使用互补色原理的浅色版本，突出图片内容`,
      });

      // 候选颜色3：第二主色调浅色版
      if (topColors.length > 1) {
        const secondColor = topColors[1];
        candidateColors.push({
          color: this.adjustColorForBackground(secondColor, 0.9, 0.18),
          style: "渐变和谐",
          description: `基于第二主色调的浅色版本，营造渐变和谐效果`,
        });
      }

      // 候选颜色4：类似色浅色版
      const analogousColor = this.getAnalogousColor(dominantColor);
      candidateColors.push({
        color: this.adjustColorForBackground(analogousColor, 0.88, 0.2),
        style: "自然过渡",
        description: `使用类似色原理的浅色版本，营造自然过渡效果`,
      });

      // 候选颜色5：第三主色调浅色版
      if (topColors.length > 2) {
        const thirdColor = topColors[2];
        candidateColors.push({
          color: this.adjustColorForBackground(thirdColor, 0.86, 0.22),
          style: "丰富层次",
          description: `基于第三主色调的浅色版本，创造丰富层次`,
        });
      }
    }

    // 去重处理：移除相似的颜色
    const uniqueColors = this.removeSimilarColors(candidateColors);

    // 确保所有颜色都是浅色，如果不是浅色则调整
    const lightColors = uniqueColors.map(colorOption => {
      if (this.isDarkColor(colorOption.color)) {
        // 如果是暗色，调整为浅色版本
        const rgb = this.parseColor(colorOption.color);
        if (rgb) {
          const lightColor = this.makeColorLight(rgb.r, rgb.g, rgb.b);
          return {
            ...colorOption,
            color: lightColor,
            style: colorOption.style + "（浅色版）",
          };
        }
      }
      return colorOption;
    });

    // 返回前3个最佳选项
    return lightColors.slice(0, 3);
  }

  /**
   * 将颜色调整为浅色版本
   */
  static makeColorLight(r: number, g: number, b: number): string {
    // 转换为HSL
    const hsl = this.rgbToHsl(r, g, b);

    // 提高亮度到85-95%，降低饱和度到10-20%
    hsl.l = Math.min(0.95, Math.max(0.85, hsl.l + 0.3));
    hsl.s = Math.min(0.2, Math.max(0.1, hsl.s * 0.3));

    // 转换回RGB
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  /**
   * 获取暗色背景色 - 基于主色调生成暗色版本
   */
  static getDarkBackgroundColor(dominantColor: number): string {
    const r = (dominantColor >> 16) & 0xff;
    const g = (dominantColor >> 8) & 0xff;
    const b = dominantColor & 0xff;

    // 转换为HSL
    const hsl = this.rgbToHsl(r, g, b);

    // 生成暗色版本：保持色相，降低亮度到20-30%，适当降低饱和度
    hsl.l = Math.min(0.3, Math.max(0.15, hsl.l * 0.3));
    hsl.s = Math.min(0.8, Math.max(0.3, hsl.s * 0.7));

    // 转换回RGB
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  /**
   * 判断是否为暗色
   */
  static isDarkColor(colorStr: string): boolean {
    // 解析颜色字符串
    let r: number, g: number, b: number;

    if (colorStr.startsWith("rgb(")) {
      const matches = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (matches) {
        r = parseInt(matches[1]);
        g = parseInt(matches[2]);
        b = parseInt(matches[3]);
      } else {
        return false;
      }
    } else if (colorStr.startsWith("#")) {
      const hex = colorStr.slice(1);
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    } else {
      return false;
    }

    // 计算亮度 (使用标准亮度公式)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128; // 亮度小于128认为是暗色
  }

  /**
   * 移除相似的颜色
   */
  static removeSimilarColors(colors: ColorOption[]): ColorOption[] {
    const uniqueColors: ColorOption[] = [];

    for (const colorOption of colors) {
      let isSimilar = false;

      for (const existingColor of uniqueColors) {
        if (this.areColorsSimilar(colorOption.color, existingColor.color)) {
          isSimilar = true;
          break;
        }
      }

      if (!isSimilar) {
        uniqueColors.push(colorOption);
      }
    }

    return uniqueColors;
  }

  /**
   * 判断两个颜色是否相似
   */
  static areColorsSimilar(color1: string, color2: string): boolean {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);

    if (!rgb1 || !rgb2) return false;

    // 计算欧几里得距离
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );

    // 距离小于30认为是相似颜色
    return distance < 30;
  }

  /**
   * 解析颜色字符串为RGB对象
   */
  static parseColor(
    colorStr: string
  ): { r: number; g: number; b: number } | null {
    if (colorStr.startsWith("rgb(")) {
      const matches = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (matches) {
        return {
          r: parseInt(matches[1]),
          g: parseInt(matches[2]),
          b: parseInt(matches[3]),
        };
      }
    } else if (colorStr.startsWith("#")) {
      const hex = colorStr.slice(1);
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16),
      };
    }
    return null;
  }

  /**
   * 获取互补色（色轮上相对180度的颜色）
   */
  static getComplementaryColor(color: number): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    // 转换为HSL
    const hsl = this.rgbToHsl(r, g, b);

    // 互补色：色相+180度
    hsl.h = (hsl.h + 180) % 360;

    // 转换回RGB
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return (rgb.r << 16) | (rgb.g << 8) | rgb.b;
  }

  /**
   * 获取类似色（色轮上相邻30度的颜色）
   */
  static getAnalogousColor(color: number): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    // 转换为HSL
    const hsl = this.rgbToHsl(r, g, b);

    // 类似色：色相+30度
    hsl.h = (hsl.h + 30) % 360;

    // 转换回RGB
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return (rgb.r << 16) | (rgb.g << 8) | rgb.b;
  }

  /**
   * 获取三色组合色（色轮上相距120度的颜色）
   */
  static getTriadicColor(color: number): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    // 转换为HSL
    const hsl = this.rgbToHsl(r, g, b);

    // 三色组合：色相+120度
    hsl.h = (hsl.h + 120) % 360;

    // 转换回RGB
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return (rgb.r << 16) | (rgb.g << 8) | rgb.b;
  }

  /**
   * 从单张图片采样颜色
   */
  static sampleImageColors(img: HTMLImageElement): number[] {
    const canvas = document.createElement("canvas");
    const sampleSize = 50; // 缩小图片以提高性能
    canvas.width = sampleSize;
    canvas.height = sampleSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return [];

    ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

    try {
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const colors: number[] = [];

      // 每隔几个像素采样一次
      for (let i = 0; i < imageData.data.length; i += 4 * 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];

        // 跳过透明像素
        if (a < 128) continue;

        // 将RGB打包成一个数字
        colors.push((r << 16) | (g << 8) | b);
      }

      return colors;
    } catch (error) {
      console.error("采样图片颜色失败:", error);
      return [];
    }
  }

  /**
   * 找出前N个主要颜色
   */
  static findTopColors(colors: number[], count: number): number[] {
    if (colors.length === 0) {
      return [0xe8f5e9]; // 默认浅绿色
    }

    // 颜色分桶（减少颜色数量以找到主色调）
    const buckets = new Map<number, number>();

    colors.forEach(color => {
      // 将颜色量化到较粗的粒度（每个通道32级）
      const r = ((color >> 16) & 0xff) >> 3;
      const g = ((color >> 8) & 0xff) >> 3;
      const b = (color & 0xff) >> 3;
      const bucket = (r << 10) | (g << 5) | b;

      buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
    });

    // 按出现次数排序，取前N个
    const sortedBuckets = Array.from(buckets.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count);

    // 将桶还原为RGB
    return sortedBuckets.map(([bucket]) => {
      const r = ((bucket >> 10) & 0x1f) << 3;
      const g = ((bucket >> 5) & 0x1f) << 3;
      const b = (bucket & 0x1f) << 3;
      return (r << 16) | (g << 8) | b;
    });
  }

  /**
   * 找出主色调
   */
  static findDominantColor(colors: number[]): number {
    if (colors.length === 0) {
      return 0xe8f5e9; // 默认浅绿色
    }

    // 颜色分桶（减少颜色数量以找到主色调）
    const buckets = new Map<number, number>();

    colors.forEach(color => {
      // 将颜色量化到较粗的粒度（每个通道32级）
      const r = ((color >> 16) & 0xff) >> 3;
      const g = ((color >> 8) & 0xff) >> 3;
      const b = (color & 0xff) >> 3;
      const bucket = (r << 10) | (g << 5) | b;

      buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
    });

    // 找出出现次数最多的颜色桶
    let maxCount = 0;
    let dominantBucket = 0;

    buckets.forEach((count, bucket) => {
      if (count > maxCount) {
        maxCount = count;
        dominantBucket = bucket;
      }
    });

    // 将桶还原为RGB
    const r = ((dominantBucket >> 10) & 0x1f) << 3;
    const g = ((dominantBucket >> 5) & 0x1f) << 3;
    const b = (dominantBucket & 0x1f) << 3;

    return (r << 16) | (g << 8) | b;
  }

  /**
   * 调整颜色使其适合作为背景色
   * 提高亮度，降低饱和度
   */
  static adjustColorForBackground(
    color: number,
    brightness: number = 0.85,
    saturation: number = 0.4
  ): string {
    let r = (color >> 16) & 0xff;
    let g = (color >> 8) & 0xff;
    let b = color & 0xff;

    // 转换为HSL
    const hsl = this.rgbToHsl(r, g, b);

    // 调整：使用传入的亮度和饱和度参数
    hsl.l = Math.min(
      0.95,
      Math.max(0.7, hsl.l * brightness + (1 - brightness) * 0.8)
    );
    hsl.s = Math.min(0.6, Math.max(0.1, hsl.s * saturation));

    // 转换回RGB
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);

    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  /**
   * RGB转HSL
   */
  static rgbToHsl(
    r: number,
    g: number,
    b: number
  ): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number, l: number;

    l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // 无色彩
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }

    return { h: h * 360, s, l };
  }

  /**
   * HSL转RGB
   */
  static hslToRgb(h: number, s: number, l: number): RGBColor {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l; // 无色彩
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }
}
