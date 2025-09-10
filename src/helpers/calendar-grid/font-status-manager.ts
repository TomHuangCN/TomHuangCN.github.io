import { baseFontOptions, getAllFontOptions } from "./constants";
import {
  isFontLoaded,
  getFontLoadingStatus,
  loadCustomFonts,
} from "../../utils/font-loader";

// 字体状态管理
export class FontStatusManager {
  private static instance: FontStatusManager;
  private statusCallbacks: Array<(fonts: typeof baseFontOptions) => void> = [];
  private currentFonts = [...baseFontOptions];

  private constructor() {
    this.loadCustomFontsAndStartMonitoring();
  }

  public static getInstance(): FontStatusManager {
    if (!FontStatusManager.instance) {
      FontStatusManager.instance = new FontStatusManager();
    }
    return FontStatusManager.instance;
  }

  // 加载自定义字体并开始监控
  private async loadCustomFontsAndStartMonitoring(): Promise<void> {
    try {
      // 获取包含自定义字体的完整列表
      await this.updateFontList();
      // 然后开始监控
      this.startMonitoring();
    } catch (error) {
      console.error("加载自定义字体失败:", error);
      // 即使失败也要开始监控
      this.startMonitoring();
    }
  }

  // 更新字体列表
  private async updateFontList(): Promise<void> {
    try {
      const allFonts = await getAllFontOptions();
      this.currentFonts = allFonts;
      this.notifyStatusChange();
      console.log("字体状态管理器更新完成，共", allFonts.length, "个字体");
    } catch (error) {
      console.error("更新字体列表失败:", error);
    }
  }

  // 开始监控字体加载状态
  private startMonitoring(): void {
    // 立即检查一次状态
    this.updateFontStatus();

    // 定期检查字体加载状态
    const checkInterval = setInterval(() => {
      this.updateFontStatus();

      // 如果所有字体都已加载完成，停止检查
      if (this.currentFonts.every(font => font.isLoaded)) {
        clearInterval(checkInterval);
      }
    }, 500);

    // 监听字体加载完成事件
    document.addEventListener("DOMContentLoaded", () => {
      this.updateFontStatus();
    });

    // 监听字体加载状态变化
    window.addEventListener("load", () => {
      this.updateFontStatus();
    });
  }

  // 更新字体状态
  private updateFontStatus(): void {
    let hasChanges = false;
    const globalStatus = getFontLoadingStatus();

    this.currentFonts.forEach(font => {
      if (font.name === "系统默认") {
        // 系统默认字体始终可用
        if (!font.isLoaded) {
          font.isLoaded = true;
          font.isLoading = false;
          hasChanges = true;
        }
      } else {
        // 检查自定义字体是否已加载
        const isLoaded = isFontLoaded(font.name);
        const wasLoading = font.isLoading;

        // 设置加载状态
        if (globalStatus.isLoading && !isLoaded) {
          font.isLoading = true;
          font.isLoaded = false;
          hasChanges = true;
        } else if (isLoaded && !font.isLoaded) {
          font.isLoading = false;
          font.isLoaded = true;
          hasChanges = true;
        } else if (wasLoading && !globalStatus.isLoading && !isLoaded) {
          // 如果全局加载完成但字体仍未加载，说明加载失败
          font.isLoading = false;
          font.isLoaded = false;
          hasChanges = true;
        }
      }
    });

    // 如果有变化，通知所有监听器
    if (hasChanges) {
      this.notifyStatusChange();
    }
  }

  // 获取当前字体状态
  public getFontStatus(): typeof baseFontOptions {
    return [...this.currentFonts];
  }

  // 订阅状态变化
  public subscribe(
    callback: (fonts: typeof baseFontOptions) => void
  ): () => void {
    this.statusCallbacks.push(callback);

    // 立即返回当前状态
    callback([...this.currentFonts]);

    // 返回取消订阅函数
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  // 通知状态变化
  private notifyStatusChange(): void {
    this.statusCallbacks.forEach(callback => {
      callback([...this.currentFonts]);
    });
  }

  // 手动刷新状态
  public refreshStatus(): void {
    this.updateFontStatus();
  }

  // 重新加载自定义字体
  public async reloadCustomFonts(): Promise<void> {
    try {
      await loadCustomFonts();
      await this.updateFontList();
    } catch (error) {
      console.error("重新加载自定义字体失败:", error);
    }
  }
}

// 导出单例实例
export const fontStatusManager = FontStatusManager.getInstance();
