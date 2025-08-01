// 通用 IndexedDB Storage 基类
export interface StorageData {
  id: string;

  [key: string]: unknown;
}

export interface StorageConfig {
  dbName: string;
  storeName: string;
  version?: number;
  maxItems?: number;
}

// 修正：将 BaseStorageMap 泛型化，避免 unknown 类型报错
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BaseStorageMap = Map<string, BaseStorage<any>>;

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

  // 初始化数据库
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

  // 保存数据
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

  // 获取单个数据
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

  // 获取所有数据
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

  // 删除数据
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

  // 清空所有数据
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

  // 检查是否存在
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

  // 获取数据数量
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

  // 清理旧数据
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

  // 导出数据
  async exportData(): Promise<string> {
    try {
      const data = await this.getAll();
      const exportData = {
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

  // 导入数据
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

// Storage 管理器
export class StorageManager {
  private static instance: StorageManager;
  // 修正：使用 BaseStorageMap 泛型，避免 unknown 类型报错
  private storages: BaseStorageMap = new Map();

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // 注册 storage
  register<T extends StorageData>(name: string, storage: BaseStorage<T>): void {
    this.storages.set(name, storage);
  }

  // 获取 storage
  get<T extends StorageData>(name: string): BaseStorage<T> | undefined {
    return this.storages.get(name) as BaseStorage<T> | undefined;
  }

  // 获取所有 storage 名称
  getAllStorageNames(): string[] {
    return Array.from(this.storages.keys());
  }

  // 导出所有数据
  async exportAllData(): Promise<string> {
    try {
      const allData: Record<string, string> = {};

      for (const [name, storage] of this.storages) {
        allData[name] = await storage.exportData();
      }

      const exportData = {
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

  // 导入所有数据
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

  // 下载数据文件
  downloadData(filename: string, data: string): void {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 读取文件数据
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
