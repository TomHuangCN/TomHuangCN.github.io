/**
 * 字体预加载工具
 * 用于在应用启动时预加载所有字体到内存中，避免导出时字体加载延迟
 */

const fontMap: Record<string, string> = {
  "Ma Shan Zheng": "/assets/fonts/MaShanZheng-Regular.ttf",
  Xiaolai: "/assets/fonts/Xiaolai-Regular.ttf",
  "VonwaonBitmap-12px": "/assets/fonts/VonwaonBitmap-12px.ttf",
  千图小兔体: "/assets/fonts/千图小兔体.ttf",
};

const fontCache = new Map<string, string>();
let isLoading = false;
let isLoaded = false;
const loadCallbacks: Array<() => void> = [];

const loadFontToBase64 = async (fontFamily: string): Promise<string | null> => {
  if (fontCache.has(fontFamily)) {
    return fontCache.get(fontFamily) || null;
  }

  const fontPath = fontMap[fontFamily];
  if (!fontPath) return null;

  try {
    const baseUrl = window.location.origin;
    // const absoluteUrl = `${baseUrl}${fontPath}`;
    const response = await fetch(baseUrl);

    if (!response.ok) {
      throw new Error(
        `字体文件下载失败: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = "";

    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }

    const base64 = btoa(binaryString);
    const format = fontPath.toLowerCase().endsWith(".ttf")
      ? "truetype"
      : "opentype";
    const dataUrl = `data:font/${format};base64,${base64}`;

    fontCache.set(fontFamily, dataUrl);
    console.log(
      `字体 ${fontFamily} 已预加载 (${(arrayBuffer.byteLength / 1024).toFixed(1)}KB)`
    );

    return dataUrl;
  } catch (error) {
    console.error(`预加载字体 ${fontFamily} 失败:`, error);
    return null;
  }
};

export const preloadAllFonts = async (): Promise<void> => {
  if (isLoaded) return Promise.resolve();

  if (isLoading) {
    return new Promise<void>(resolve => {
      loadCallbacks.push(resolve);
    });
  }

  isLoading = true;
  console.log("开始预加载所有字体...");

  try {
    const fontFamilies = Object.keys(fontMap);
    await Promise.all(
      fontFamilies.map(fontFamily => loadFontToBase64(fontFamily))
    );

    isLoaded = true;
    console.log(`字体预加载完成，共加载 ${fontFamilies.length} 个字体`);

    loadCallbacks.forEach(callback => callback());
    loadCallbacks.length = 0;
  } catch (error) {
    console.error("字体预加载失败:", error);
    throw error;
  } finally {
    isLoading = false;
  }
};

/**
 * 获取已缓存的字体 base64 数据
 */
export const getCachedFont = (fontFamily: string): string | null => {
  return fontCache.get(fontFamily) || null;
};

/**
 * 获取所有已缓存的字体
 */
export const getAllCachedFonts = (): Map<string, string> => {
  return new Map(fontCache);
};

/**
 * 检查字体是否已加载
 */
export const isFontLoaded = (fontFamily: string): boolean => {
  return fontCache.has(fontFamily);
};

/**
 * 检查所有字体是否已加载
 */
export const areAllFontsLoaded = (): boolean => {
  return isLoaded;
};

/**
 * 获取字体加载状态
 */
export const getFontLoadingStatus = (): {
  isLoading: boolean;
  isLoaded: boolean;
  loadedCount: number;
  totalCount: number;
} => {
  return {
    isLoading,
    isLoaded,
    loadedCount: fontCache.size,
    totalCount: Object.keys(fontMap).length,
  };
};

/**
 * 清除字体缓存
 */
export const clearFontCache = (): void => {
  fontCache.clear();
  isLoaded = false;
  console.log("字体缓存已清除");
};

export const analyzeUsedFonts = (htmlContent: string): Set<string> => {
  const usedFonts = new Set<string>();
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  const traverseElements = (element: Element) => {
    const inlineFontFamily = element.getAttribute("style");
    if (inlineFontFamily) {
      const fontFamilyMatch = inlineFontFamily.match(/font-family:\s*([^;]+)/i);
      if (fontFamilyMatch) {
        const fonts = fontFamilyMatch[1]
          .split(",")
          .map(font => font.trim().replace(/['"]/g, ""))
          .filter(
            font =>
              font &&
              font !== "inherit" &&
              font !== "initial" &&
              font !== "unset"
          );

        fonts.forEach(font => {
          if (Object.keys(fontMap).includes(font)) {
            usedFonts.add(font);
          }
        });
      }
    }

    const className = element.getAttribute("class");
    if (className) {
      const classNames = className.split(" ");
      classNames.forEach(cls => {
        if (
          cls.toLowerCase().includes("font-") ||
          cls.toLowerCase().includes("text-")
        ) {
          Object.keys(fontMap).forEach(fontFamily => {
            if (
              cls
                .toLowerCase()
                .includes(fontFamily.toLowerCase().replace(/\s+/g, "-"))
            ) {
              usedFonts.add(fontFamily);
            }
          });
        }
      });
    }

    Array.from(element.children).forEach(child => {
      traverseElements(child);
    });
  };

  traverseElements(tempDiv);
  return usedFonts;
};

export const generateFontDefinitions = (htmlContent?: string): string => {
  const fontFamilies = htmlContent
    ? Array.from(analyzeUsedFonts(htmlContent))
    : Object.keys(fontMap);

  return fontFamilies
    .map(fontFamily => {
      const fontDataUrl = fontCache.get(fontFamily);
      if (!fontDataUrl) return "";

      const fontPath = fontMap[fontFamily];
      const format = fontPath?.toLowerCase().endsWith(".ttf")
        ? "truetype"
        : "opentype";

      return `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontDataUrl}') format('${format}');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `;
    })
    .filter(Boolean)
    .join("");
};

export const autoPreloadFonts = (): void => {
  const startPreload = () => preloadAllFonts().catch(console.error);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startPreload);
  } else {
    startPreload();
  }
};

// 导出字体映射表供其他模块使用
export { fontMap };
