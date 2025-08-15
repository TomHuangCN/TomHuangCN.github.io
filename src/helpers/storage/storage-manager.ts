// ============================================================================
// 存储管理器
// ============================================================================

import type { StorageData, AllExportData } from "./types";
import { BaseStorage } from "./base-storage";

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
  // 数据压缩
  // --------------------------------------------------------------------------

  /**
   * 压缩数据
   */
  private compressData(data: string): string {
    try {
      // 使用简单的压缩：移除多余空格和换行
      const compressed = data
        .replace(/\s+/g, " ")
        .replace(/"\s*:\s*"/g, '":"')
        .replace(/"\s*,\s*"/g, '","')
        .replace(/"\s*}\s*"/g, '"}"')
        .replace(/"\s*]\s*"/g, '"]"');

      // 如果压缩后数据更大，返回原始数据
      return compressed.length < data.length ? compressed : data;
    } catch (error) {
      console.warn("压缩失败，使用原始数据:", error);
      return data;
    }
  }

  /**
   * 解压数据
   */
  private decompressData(compressedData: string): string {
    // 简单压缩不需要解压，直接返回
    return compressedData;
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
        version: "2.0",
        timestamp: Date.now(),
        compressed: true,
        storages: allData,
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      return this.compressData(jsonData);
    } catch (error) {
      console.error("导出所有数据失败:", error);
      throw error;
    }
  }

  /**
   * 导入所有存储的数据
   */
  async importAllData(data: string): Promise<boolean> {
    try {
      let jsonData: string;
      let importData: AllExportData;

      // 尝试解压数据
      try {
        jsonData = this.decompressData(data);
        importData = JSON.parse(jsonData);
      } catch {
        // 如果解压失败，尝试直接解析（兼容旧版本）
        try {
          importData = JSON.parse(data);
        } catch {
          throw new Error("无效的数据格式");
        }
      }

      // 检查数据版本和格式
      if (!importData.storages || typeof importData.storages !== "object") {
        throw new Error("无效的数据格式");
      }

      // 处理不同版本的数据
      if (importData.version === "2.0" && importData.compressed) {
        // 新版本：数据已解压，直接使用
        for (const [name, storageData] of Object.entries(importData.storages)) {
          const storage = this.storages.get(name);
          if (storage && typeof storageData === "string") {
            await storage.importData(storageData);
          }
        }
      } else {
        // 旧版本：数据可能未压缩，直接使用
        for (const [name, storageData] of Object.entries(importData.storages)) {
          const storage = this.storages.get(name);
          if (storage && typeof storageData === "string") {
            await storage.importData(storageData);
          }
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
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
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
