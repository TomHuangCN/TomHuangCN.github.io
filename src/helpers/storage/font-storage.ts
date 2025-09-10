import { BaseStorage } from "./base-storage";
import type { StorageData } from "./types";

export interface CustomFontData extends StorageData {
  id: string;
  name: string;
  displayName: string;
  fontData: string; // base64 编码的字体数据
  format: string; // ttf, woff, woff2 等
  size: number; // 文件大小（字节）
  uploadTime: number;
}

export class FontStorage extends BaseStorage<CustomFontData> {
  constructor() {
    super({
      dbName: "CalendarFontsDB",
      storeName: "customFonts",
      version: 1,
      maxItems: 50, // 最多保存50个自定义字体
    });
  }

  /**
   * 保存自定义字体
   */
  async saveCustomFont(
    name: string,
    displayName: string,
    fontData: string,
    format: string,
    size: number
  ): Promise<boolean> {
    const fontDataObj: CustomFontData = {
      id: `custom-font-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      displayName,
      fontData,
      format,
      size,
      uploadTime: Date.now(),
    };

    return await this.save(fontDataObj);
  }

  /**
   * 获取所有自定义字体
   */
  async getAllCustomFonts(): Promise<CustomFontData[]> {
    return await this.getAll();
  }

  /**
   * 根据名称获取字体
   */
  async getFontByName(name: string): Promise<CustomFontData | null> {
    const fonts = await this.getAllCustomFonts();
    return fonts.find(font => font.name === name) || null;
  }

  /**
   * 删除自定义字体
   */
  async deleteCustomFont(name: string): Promise<boolean> {
    const fonts = await this.getAllCustomFonts();
    const font = fonts.find(f => f.name === name);
    if (font) {
      return await this.delete(font.id);
    }
    return false;
  }

  /**
   * 检查字体名称是否已存在
   */
  async isFontNameExists(name: string): Promise<boolean> {
    const font = await this.getFontByName(name);
    return font !== null;
  }

  /**
   * 获取存储使用情况
   */
  async getStorageInfo(): Promise<{
    totalFonts: number;
    totalSize: number;
    maxSize: number;
  }> {
    const fonts = await this.getAllCustomFonts();
    const totalSize = fonts.reduce((sum, font) => sum + font.size, 0);
    const maxSize = 50 * 1024 * 1024; // 50MB 限制

    return {
      totalFonts: fonts.length,
      totalSize,
      maxSize,
    };
  }
}
