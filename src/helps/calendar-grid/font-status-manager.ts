import { fontOptions } from "./constants";
import { isFontLoaded, getFontLoadingStatus } from "../../utils/font-loader";

// 字体状态管理
export class FontStatusManager {
  private static instance: FontStatusManager;
  private statusCallbacks: Array<(fonts: typeof fontOptions) => void> = [];
  private currentFonts = [...fontOptions];

  private constructor() {
    this.startMonitoring();
  }

  public static getInstance(): FontStatusManager {
    if (!FontStatusManager.instance) {
      FontStatusManager.instance = new FontStatusManager();
    }
    return FontStatusManager.instance;
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
  public getFontStatus(): typeof fontOptions {
    return [...this.currentFonts];
  }

  // 订阅状态变化
  public subscribe(callback: (fonts: typeof fontOptions) => void): () => void {
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
}

// 导出单例实例
export const fontStatusManager = FontStatusManager.getInstance();
