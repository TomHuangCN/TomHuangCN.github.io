/**
 * 字体预加载工具
 * 用于在应用启动时预加载所有字体到内存中，避免导出时字体加载延迟
 */

const fontMap: Record<string, string> = {
  "Ma Shan Zheng": "/assets/fonts/MaShanZheng-Regular.ttf",
  Xiaolai: "/assets/fonts/Xiaolai-Regular.woff2",
  "VonwaonBitmap-12px": "/assets/fonts/VonwaonBitmap-12px.ttf",
  千图小兔体: "/assets/fonts/千图小兔体.ttf",
};

// 自定义字体映射（从IndexedDB加载）
const customFontMap: Record<string, string> = {};

const fontCache = new Map<string, string>();
let isLoading = false;
let isLoaded = false;
const loadCallbacks: Array<() => void> = [];

const loadFontToBase64 = async (fontFamily: string): Promise<string | null> => {
  if (fontCache.has(fontFamily)) {
    return fontCache.get(fontFamily) || null;
  }

  // 首先检查自定义字体
  const customFontPath = customFontMap[fontFamily];
  if (customFontPath) {
    fontCache.set(fontFamily, customFontPath);
    return customFontPath;
  }

  // 然后检查内置字体
  const fontPath = fontMap[fontFamily];
  if (!fontPath) return null;

  try {
    // const baseUrl = window.location.origin;
    // const absoluteUrl = `${baseUrl}${fontPath}`;
    const response = await fetch(fontPath);

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
      : fontPath.toLowerCase().endsWith(".woff2")
        ? "woff2"
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
    // 先加载自定义字体
    await loadCustomFonts();

    // 再加载内置字体
    const fontFamilies = Object.keys(fontMap);
    await Promise.all(
      fontFamilies.map(fontFamily => loadFontToBase64(fontFamily))
    );

    isLoaded = true;
    const totalFonts =
      Object.keys(fontMap).length + Object.keys(customFontMap).length;
    console.log(`字体预加载完成，共加载 ${totalFonts} 个字体`);

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
  const allFonts = getAllFonts();
  const fontFamilies = htmlContent
    ? Array.from(analyzeUsedFonts(htmlContent))
    : Object.keys(allFonts);

  return fontFamilies
    .map(fontFamily => {
      const fontDataUrl = fontCache.get(fontFamily);
      if (!fontDataUrl) return "";

      // 检查是自定义字体还是内置字体
      const isCustomFont = customFontMap[fontFamily];
      let format = "truetype";

      if (isCustomFont) {
        // 自定义字体，从存储中获取格式信息
        const fontData = fontDataUrl.match(/data:font\/([^;]+);base64,/);
        if (fontData) {
          format = fontData[1];
        }
      } else {
        // 内置字体
        const fontPath = fontMap[fontFamily];
        format = fontPath?.toLowerCase().endsWith(".ttf")
          ? "truetype"
          : fontPath?.toLowerCase().endsWith(".woff2")
            ? "woff2"
            : "opentype";
      }

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

/**
 * 从IndexedDB加载自定义字体
 */
export const loadCustomFonts = async (): Promise<void> => {
  try {
    // 动态导入FontStorage以避免循环依赖
    const { FontStorage } = await import("../helpers/storage/font-storage");
    const fontStorage = new FontStorage();
    const customFonts = await fontStorage.getAllCustomFonts();

    // 清空现有的自定义字体映射
    Object.keys(customFontMap).forEach(key => {
      removeFontFromCSS(key);
      delete customFontMap[key];
    });

    // 加载自定义字体到映射表
    for (const font of customFonts) {
      const format =
        font.format === "truetype"
          ? "truetype"
          : font.format === "woff"
            ? "woff"
            : font.format === "woff2"
              ? "woff2"
              : "opentype";

      const dataUrl = `data:font/${format};base64,${font.fontData}`;
      customFontMap[font.name] = dataUrl;

      // 同时添加到缓存中
      fontCache.set(font.name, dataUrl);

      // 添加到CSS中
      addFontToCSS(font.name, dataUrl, format);

      console.log(`自定义字体 ${font.displayName} 已加载`);
    }

    console.log(`加载了 ${customFonts.length} 个自定义字体`);
  } catch (error) {
    console.error("加载自定义字体失败:", error);
  }
};

/**
 * 添加自定义字体到映射表
 */
export const addCustomFont = (
  name: string,
  fontData: string,
  format: string
): void => {
  const dataUrl = `data:font/${format};base64,${fontData}`;
  customFontMap[name] = dataUrl;
  fontCache.set(name, dataUrl);

  // 动态添加到CSS中
  addFontToCSS(name, dataUrl, format);
};

/**
 * 移除自定义字体
 */
export const removeCustomFont = (name: string): void => {
  delete customFontMap[name];
  fontCache.delete(name);

  // 从CSS中移除
  removeFontFromCSS(name);
};

/**
 * 动态添加字体到CSS
 */
export const addFontToCSS = (
  fontFamily: string,
  dataUrl: string,
  format: string
): void => {
  // 检查是否已经存在
  const existingStyle = document.getElementById(`font-${fontFamily}`);
  if (existingStyle) {
    return; // 已经存在，不需要重复添加
  }

  const style = document.createElement("style");
  style.id = `font-${fontFamily}`;
  style.textContent = `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${dataUrl}') format('${format}');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;

  document.head.appendChild(style);
  console.log(`字体 ${fontFamily} 已添加到CSS`);
};

/**
 * 从CSS中移除字体
 */
export const removeFontFromCSS = (fontFamily: string): void => {
  const existingStyle = document.getElementById(`font-${fontFamily}`);
  if (existingStyle) {
    existingStyle.remove();
    console.log(`字体 ${fontFamily} 已从CSS中移除`);
  }
};

/**
 * 获取所有字体（包括自定义字体）
 */
export const getAllFonts = (): Record<string, string> => {
  return { ...fontMap, ...customFontMap };
};

// 导出字体映射表供其他模块使用
export { fontMap, customFontMap };
