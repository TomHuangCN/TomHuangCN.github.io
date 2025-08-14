// ============================================================================
// 存储管理器
// ============================================================================

import type { StorageData, AllExportData } from './types';
import { BaseStorage } from './base-storage';
import { generateTimestampedFilename } from './utils';

/**
 * 存储管理器
 * 管理多个存储实例，提供统一的访问接口
 */
export class StorageManager {
  private static instance: StorageManager;
  private storages = new Map<string, BaseStorage<StorageData>>();

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // --------------------------------------------------------------------------
  // 存储实例管理
  // --------------------------------------------------------------------------

  /**
   * 注册存储实例
   */
  register<T extends StorageData>(name: string, storage: BaseStorage<T>): void {
    this.storages.set(name, storage);
  }

  /**
   * 获取存储实例
   */
  get<T extends StorageData>(name: string): BaseStorage<T> | undefined {
    return this.storages.get(name) as BaseStorage<T> | undefined;
  }

  /**
   * 获取所有存储名称
   */
  getAllStorageNames(): string[] {
    return Array.from(this.storages.keys());
  }

  // --------------------------------------------------------------------------
  // 批量数据操作
  // --------------------------------------------------------------------------

  /**
   * 导出所有存储的数据
   */
  async exportAllData(): Promise<string> {
    try {
      const allData: Record<string, string> = {};

      for (const [name, storage] of this.storages) {
        allData[name] = await storage.exportData();
      }

      const exportData: AllExportData = {
        version: "1.0",
        timestamp: Date.now(),
        storages: allData,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("导出所有数据失败:", error);
      throw error;
    }
  }

  /**
   * 导入所有存储的数据
   */
  async importAllData(jsonData: string): Promise<boolean> {
    try {
      const importData = JSON.parse(jsonData);

      if (!importData.storages || typeof importData.storages !== "object") {
        throw new Error("无效的数据格式");
      }

      for (const [name, data] of Object.entries(importData.storages)) {
        const storage = this.storages.get(name);
        if (storage && typeof data === "string") {
          await storage.importData(data);
        }
      }

      return true;
    } catch (error) {
      console.error("导入所有数据失败:", error);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // 文件操作
  // --------------------------------------------------------------------------

  /**
   * 下载数据文件
   */
  downloadData(filename: string, data: string): void {
    const finalFilename = generateTimestampedFilename(filename);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 读取文件数据
   */
  readFileData(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

// 导出单例实例
export const storageManager = StorageManager.getInstance();
