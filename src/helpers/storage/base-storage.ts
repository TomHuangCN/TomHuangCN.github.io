// ============================================================================
// 基础存储类
// ============================================================================

import type { StorageData, StorageConfig, ExportData } from "./types";

/**
 * IndexedDB 存储基类
 * 提供基本的 CRUD 操作和数据库管理功能
 */
export abstract class BaseStorage<T extends StorageData> {
  protected readonly config: StorageConfig;
  protected db: IDBDatabase | null = null;

  constructor(config: StorageConfig) {
    this.config = {
      version: 1,
      maxItems: 100,
      ...config,
    };
  }

  // --------------------------------------------------------------------------
  // 数据库初始化
  // --------------------------------------------------------------------------

  /**
   * 初始化数据库连接
   */
  protected async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version!);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, {
            keyPath: "id",
          });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  // --------------------------------------------------------------------------
  // 基本 CRUD 操作
  // --------------------------------------------------------------------------

  /**
   * 保存数据
   */
  async save(data: T): Promise<boolean> {
    try {
      const db = await this.initDB();
      const dataWithTimestamp = {
        ...data,
        timestamp: Date.now(),
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [this.config.storeName],
          "readwrite"
        );
        const store = transaction.objectStore(this.config.storeName);
        const request = store.put(dataWithTimestamp);

        request.onsuccess = async () => {
          await this.cleanupOldData();
          resolve(true);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("保存数据失败:", error);
      return false;
    }
  }

  /**
   * 获取单个数据
   */
  async get(id: string): Promise<T | null> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.config.storeName], "readonly");
        const store = transaction.objectStore(this.config.storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("获取数据失败:", error);
      return null;
    }
  }

  /**
   * 获取所有数据
   */
  async getAll(): Promise<T[]> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.config.storeName], "readonly");
        const store = transaction.objectStore(this.config.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("获取所有数据失败:", error);
      return [];
    }
  }

  /**
   * 删除数据
   */
  async delete(id: string): Promise<boolean> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [this.config.storeName],
          "readwrite"
        );
        const store = transaction.objectStore(this.config.storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("删除数据失败:", error);
      return false;
    }
  }

  /**
   * 清空所有数据
   */
  async clear(): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [this.config.storeName],
          "readwrite"
        );
        const store = transaction.objectStore(this.config.storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("清空数据失败:", error);
    }
  }

  // --------------------------------------------------------------------------
  // 查询和统计操作
  // --------------------------------------------------------------------------

  /**
   * 检查数据是否存在
   */
  async exists(id: string): Promise<boolean> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.config.storeName], "readonly");
        const store = transaction.objectStore(this.config.storeName);
        const request = store.count(id);

        request.onsuccess = () => resolve(request.result > 0);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("检查数据是否存在失败:", error);
      return false;
    }
  }

  /**
   * 获取数据数量
   */
  async count(): Promise<number> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.config.storeName], "readonly");
        const store = transaction.objectStore(this.config.storeName);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("获取数据数量失败:", error);
      return 0;
    }
  }

  // --------------------------------------------------------------------------
  // 数据维护操作
  // --------------------------------------------------------------------------

  /**
   * 清理旧数据，保持数据量在限制范围内
   */
  protected async cleanupOldData(): Promise<void> {
    try {
      const allData = await this.getAll();
      if (allData.length >= (this.config.maxItems ?? 100)) {
        // 按时间戳排序，删除最旧的
        allData.sort(
          (a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0)
        );
        const toDelete = allData.slice(
          0,
          allData.length - (this.config.maxItems ?? 100) + 1
        );

        for (const item of toDelete) {
          await this.delete(item.id);
        }
      }
    } catch (error) {
      console.error("清理旧数据失败:", error);
    }
  }

  // --------------------------------------------------------------------------
  // 数据导入导出操作
  // --------------------------------------------------------------------------

  /**
   * 导出数据
   */
  async exportData(): Promise<string> {
    try {
      const data = await this.getAll();
      const exportData: ExportData = {
        version: "1.0",
        timestamp: Date.now(),
        storeName: this.config.storeName,
        data,
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("导出数据失败:", error);
      throw error;
    }
  }

  /**
   * 导入数据
   */
  async importData(jsonData: string): Promise<boolean> {
    try {
      const importData = JSON.parse(jsonData);

      // 验证数据格式
      if (!importData.data || !Array.isArray(importData.data)) {
        throw new Error("无效的数据格式");
      }

      // 清空现有数据
      await this.clear();

      // 导入新数据
      for (const item of importData.data) {
        if (item.id) {
          await this.save(item as T);
        }
      }

      return true;
    } catch (error) {
      console.error("导入数据失败:", error);
      return false;
    }
  }
}
