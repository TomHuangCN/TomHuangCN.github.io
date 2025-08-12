/**
 * 字体预加载工具
 * 用于在应用启动时预加载所有字体到内存中，避免导出时字体加载延迟
 */

// 字体映射表
const fontMap: Record<string, string> = {
  "Ma Shan Zheng": "/fonts/handwriting/MaShanZheng-Regular.ttf",
  "Han Yi Shou Xie Ti": "/fonts/handwriting/HanYiShouXieTi.ttf",
  Xiaolai: "/fonts/handwriting/Xiaolai-Regular.ttf",
};

// 字体缓存 - 存储 base64 编码的字体数据
const fontCache = new Map<string, string>();

// 加载状态
let isLoading = false;
let isLoaded = false;
const loadCallbacks: Array<() => void> = [];

/**
 * 下载字体文件并转换为 base64 格式
 */
const loadFontToBase64 = async (fontFamily: string): Promise<string | null> => {
  // 检查缓存
  if (fontCache.has(fontFamily)) {
    return fontCache.get(fontFamily) || null;
  }

  const fontPath = fontMap[fontFamily];
  if (!fontPath) return null;

  try {
    // 构建绝对路径URL
    const baseUrl = window.location.origin;
    const absoluteUrl = `${baseUrl}${fontPath}`;

    // 下载字体文件
    const response = await fetch(absoluteUrl);
    if (!response.ok) {
      throw new Error(
        `字体文件下载失败: ${response.status} ${response.statusText}`
      );
    }

    // 获取字体文件数据
    const arrayBuffer = await response.arrayBuffer();

    // 转换为 base64 - 使用更安全的方法处理大文件
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binaryString);

    // 根据文件扩展名判断格式
    const format = fontPath.toLowerCase().endsWith(".ttf")
      ? "truetype"
      : "opentype";

    // 构建 data URL
    const dataUrl = `data:font/${format};base64,${base64}`;

    // 缓存结果
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

/**
 * 预加载所有字体
 */
export const preloadAllFonts = async (): Promise<void> => {
  if (isLoaded) {
    return Promise.resolve();
  }

  if (isLoading) {
    return new Promise<void>(resolve => {
      loadCallbacks.push(resolve);
    });
  }

  isLoading = true;
  console.log("开始预加载所有字体...");

  try {
    const fontFamilies = Object.keys(fontMap);

    // 并行加载所有字体
    const loadPromises = fontFamilies.map(async fontFamily => {
      return await loadFontToBase64(fontFamily);
    });

    await Promise.all(loadPromises);

    isLoaded = true;
    console.log(`字体预加载完成，共加载 ${fontFamilies.length} 个字体`);

    // 执行所有等待的回调
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

/**
 * 分析HTML内容中使用的字体
 */
export const analyzeUsedFonts = (htmlContent: string): Set<string> => {
  const usedFonts = new Set<string>();

  // 创建临时DOM元素来解析HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  // 递归遍历所有元素，检查font-family样式
  const traverseElements = (element: Element) => {
    // 检查内联样式
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
          // 检查是否是我们支持的字体
          if (Object.keys(fontMap).includes(font)) {
            usedFonts.add(font);
          }
        });
      }
    }

    // 检查class属性，查找可能使用字体的CSS类
    const className = element.getAttribute("class");
    if (className) {
      // 这里可以添加一些常见的字体类名检查
      // 例如：如果类名包含特定字体的标识
      const classNames = className.split(" ");
      classNames.forEach(cls => {
        // 检查类名是否包含字体相关的关键词
        if (
          cls.toLowerCase().includes("font-") ||
          cls.toLowerCase().includes("text-")
        ) {
          // 这里可以添加更多的字体类名映射逻辑
          // 暂时先检查所有支持的字体
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

    // 递归检查子元素
    Array.from(element.children).forEach(child => {
      traverseElements(child);
    });
  };

  // 开始遍历
  traverseElements(tempDiv);

  return usedFonts;
};

/**
 * 生成字体CSS定义（只包含实际使用的字体）
 */
export const generateFontDefinitions = (htmlContent?: string): string => {
  let fontFamilies: string[];

  if (htmlContent) {
    // 分析HTML内容中使用的字体
    const usedFonts = analyzeUsedFonts(htmlContent);
    fontFamilies = Array.from(usedFonts);
  } else {
    // 如果没有提供HTML内容，则使用所有字体（向后兼容）
    fontFamilies = Object.keys(fontMap);
  }

  let fontDefinitions = "";

  fontFamilies.forEach(fontFamily => {
    const fontDataUrl = fontCache.get(fontFamily);
    if (fontDataUrl) {
      const fontPath = fontMap[fontFamily];
      const format = fontPath?.toLowerCase().endsWith(".ttf")
        ? "truetype"
        : "opentype";

      fontDefinitions += `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontDataUrl}') format('${format}');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `;
    }
  });

  return fontDefinitions;
};

/**
 * 在页面加载时自动预加载字体
 */
export const autoPreloadFonts = (): void => {
  // 等待页面加载完成后开始预加载
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      preloadAllFonts().catch(console.error);
    });
  } else {
    preloadAllFonts().catch(console.error);
  }
};

// 导出字体映射表供其他模块使用
export { fontMap };
