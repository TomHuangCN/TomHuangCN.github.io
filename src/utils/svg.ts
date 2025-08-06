/**
 * SVG工具函数
 * 封装SVG相关的操作
 */

export interface SvgOptions {
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string;
  customStyles?: string;
}

/**
 * 将HTML元素转换为SVG字符串
 */
export const createSvgFromElement = (
  element: HTMLElement,
  options: SvgOptions = {}
): string => {
  const {
    width,
    height,
    scale = 1,
    backgroundColor,
    customStyles = "",
  } = options;

  const rect = element.getBoundingClientRect();
  const finalWidth = (width || rect.width) * scale;
  const finalHeight = (height || rect.height) * scale;
  const htmlContent = element.outerHTML;

  // 构建样式
  const baseStyles = `
    * { 
      background: transparent !important; 
      box-sizing: border-box;
    }
  `;

  const backgroundStyle = backgroundColor
    ? `body { background-color: ${backgroundColor} !important; }`
    : "";

  const combinedStyles =
    `${baseStyles} ${backgroundStyle} ${customStyles}`.trim();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${finalWidth}" height="${finalHeight}" viewBox="0 0 ${finalWidth / scale} ${finalHeight / scale}">
      <defs>
        <style>
          ${combinedStyles}
        </style>
      </defs>
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${htmlContent}
        </div>
      </foreignObject>
    </svg>
  `;

  return svg;
};

/**
 * 将SVG字符串转换为Data URL
 */
export const svgToDataUrl = (svgString: string): string => {
  const encodedSvg = encodeURIComponent(svgString).replace(
    /%([0-9A-F]{2})/g,
    (_, p1) => String.fromCharCode(parseInt(p1, 16))
  );
  return `data:image/svg+xml;base64,${btoa(encodedSvg)}`;
};

/**
 * 将SVG字符串转换为Blob
 */
export const svgToBlob = (svgString: string): Blob => {
  return new Blob([svgString], { type: "image/svg+xml" });
};

/**
 * 下载SVG文件
 */
export const downloadSvg = (svgString: string, filename: string): void => {
  const blob = svgToBlob(svgString);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".svg") ? filename : `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 批量下载多个SVG文件
 */
export const downloadMultipleSvg = (
  svgStringList: string[],
  filenameList: string[]
): void => {
  svgStringList.forEach((svgString, index) => {
    const filename = filenameList[index] || `svg_${index + 1}`;
    setTimeout(() => {
      downloadSvg(svgString, filename);
    }, index * 100);
  });
};

/**
 * 将SVG转换为PNG（通过Canvas）
 */
export const svgToPng = async (
  svgString: string,
  options: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    quality?: number;
  } = {}
): Promise<string> => {
  const { backgroundColor, quality = 1 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("无法获取canvas上下文"));
        return;
      }

      const canvasWidth = img.width;
      const canvasHeight = img.height;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // 只有当用户明确指定背景色时才填充，否则保持透明
      if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
      ctx.drawImage(img, 0, 0);

      const pngData = canvas.toDataURL("image/png", quality);
      resolve(pngData);
    };

    img.onerror = () => {
      reject(new Error("SVG图片加载失败"));
    };

    img.src = svgToDataUrl(svgString);
  });
};

/**
 * 获取SVG的尺寸信息
 */
export const getSvgDimensions = (
  svgString: string
): { width: number; height: number } | null => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (!svgElement) {
      return null;
    }

    const width = parseFloat(svgElement.getAttribute("width") || "0");
    const height = parseFloat(svgElement.getAttribute("height") || "0");

    return { width, height };
  } catch (error) {
    console.error("解析SVG尺寸失败:", error);
    return null;
  }
};

/**
 * 验证SVG字符串是否有效
 */
export const isValidSvg = (svgString: string): boolean => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = doc.querySelector("svg");
    return svgElement !== null && !doc.querySelector("parsererror");
  } catch (error) {
    return false;
  }
};
