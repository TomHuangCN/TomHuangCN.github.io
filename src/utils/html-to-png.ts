/**
 * HTML转PNG工具函数
 * 使用 html -> svg -> canvas 的方案
 */

import { createSvgFromElement, svgToPng } from "./svg";

interface HtmlToPngOptions {
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string; // 允许用户自定义，但默认透明
  quality?: number;
}

/**
 * 将HTML元素转换为PNG图片
 * 默认导出透明背景
 */
export const htmlToPng = async (
  element: HTMLElement,
  options: HtmlToPngOptions = {}
): Promise<string> => {
  const { width, height, scale = 2, backgroundColor, quality = 1 } = options;

  const clonedElement = element.cloneNode(true) as HTMLElement;
  const computedStyle = window.getComputedStyle(element);

  clonedElement.style.position = "absolute";
  clonedElement.style.top = "0";
  clonedElement.style.width = width ? `${width}px` : computedStyle.width;
  clonedElement.style.height = height ? `${height}px` : computedStyle.height;

  // 使用新的SVG工具函数
  const svgData = createSvgFromElement(clonedElement, {
    width: width !== undefined ? width : parseInt(computedStyle.width, 10),
    height: height !== undefined ? height : parseInt(computedStyle.height, 10),
    scale,
    backgroundColor,
  });

  // 使用新的SVG转PNG函数
  return await svgToPng(svgData, {
    backgroundColor,
    quality,
  });
};

/**
 * 下载PNG图片
 */
export const downloadPng = (pngData: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = pngData;
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 批量下载多个PNG图片
 */
export const downloadMultiplePng = (
  pngDataList: string[],
  filenameList: string[]
): void => {
  pngDataList.forEach((pngData, index) => {
    const filename = filenameList[index] || `image_${index + 1}`;
    setTimeout(() => {
      downloadPng(pngData, filename);
    }, index * 100);
  });
};
