import type { StorageConfig } from "../storage/types";
import { BaseStorage } from "../storage/base-storage";
import { storageManager } from "../storage/storage-manager";
import type { Template, TemplateConfig } from "./types";

// 模板存储类
export class TemplateStorage extends BaseStorage<Template> {
  private readonly configStoreName: string;

  constructor(storeName: string = "templates") {
    const config: StorageConfig = {
      dbName: `TemplateDB_${storeName}`,
      storeName,
      version: 1,
      maxItems: 50,
    };
    super(config);
    this.configStoreName = `${storeName}_config`;

    // 注册到 storage manager
    storageManager.register(storeName, this);
  }

  // 重写初始化数据库方法，添加配置存储
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

        // 创建模板存储对象
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const templateStore = db.createObjectStore(this.config.storeName, {
            keyPath: "id",
          });
          templateStore.createIndex("timestamp", "timestamp", {
            unique: false,
          });
        }

        // 创建配置存储对象
        if (!db.objectStoreNames.contains(this.configStoreName)) {
          db.createObjectStore(this.configStoreName, { keyPath: "key" });
        }
      };
    });
  }

  // 保存模板配置
  async saveConfig(config: TemplateConfig): Promise<boolean> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.configStoreName], "readwrite");
        const store = transaction.objectStore(this.configStoreName);
        const request = store.put({ key: "template_config", ...config });

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("保存模板配置失败:", error);
      return false;
    }
  }

  // 获取模板配置
  async getConfig(): Promise<TemplateConfig> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.configStoreName], "readonly");
        const store = transaction.objectStore(this.configStoreName);
        const request = store.get("template_config");

        request.onsuccess = () => {
          const config = request.result;
          resolve(
            config || {
              enabled: false,
              selectedTemplateId: null,
            }
          );
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("获取模板配置失败:", error);
      return {
        enabled: false,
        selectedTemplateId: null,
      };
    }
  }

  // 创建新模板
  async createTemplate(
    name: string,
    pages: Template["pages"]
  ): Promise<string | null> {
    const template: Template = {
      id: Date.now().toString(),
      name,
      pages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const success = await this.save(template);
    return success ? template.id : null;
  }

  // 更新模板
  async updateTemplate(
    id: string,
    updates: Partial<Template>
  ): Promise<boolean> {
    try {
      const existing = await this.get(id);
      if (!existing) return false;

      const updated: Template = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      };

      return await this.save(updated);
    } catch (error) {
      console.error("更新模板失败:", error);
      return false;
    }
  }

  // 删除模板
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      return await this.delete(id);
    } catch (error) {
      console.error("删除模板失败:", error);
      return false;
    }
  }
}
