import {
  BaseStorage,
  StorageData,
  StorageConfig,
  storageManager,
} from "../../utils/storage";

// 日历存储工具对象
export interface Calendar extends StorageData {
  cover: string;
  pages: string[];
}

class CalendarStorage extends BaseStorage<Calendar> {
  private readonly imageStoreName: string;
  private readonly maxCalendars = 20; // 最多保存20个日历

  constructor(storeName: string = "calendars") {
    const config: StorageConfig = {
      dbName: `CalendarDB_${storeName}`,
      storeName,
      version: 1,
      maxItems: 20,
    };
    super(config);
    this.imageStoreName = `${storeName}_images`;

    // 注册到 storage manager，使用唯一的名称
    storageManager.register(storeName, this);
  }

  // 重写初始化数据库方法，添加图片存储
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

        // 创建日历存储对象
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const calendarStore = db.createObjectStore(this.config.storeName, {
            keyPath: "id",
          });
          calendarStore.createIndex("timestamp", "timestamp", {
            unique: false,
          });
        }

        // 创建图片存储对象
        if (!db.objectStoreNames.contains(this.imageStoreName)) {
          db.createObjectStore(this.imageStoreName, { keyPath: "id" });
        }
      };
    });
  }

  // 将 base64 转换为 Blob
  private async base64ToBlob(base64: string): Promise<Blob> {
    const response = await fetch(base64);
    return await response.blob();
  }

  // 将 Blob 转换为 base64
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 保存图片到 IndexedDB
  private async saveImage(id: string, base64Data: string): Promise<void> {
    const db = await this.initDB();
    const blob = await this.base64ToBlob(base64Data);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.imageStoreName], "readwrite");
      const store = transaction.objectStore(this.imageStoreName);
      const request = store.put({ id, data: blob });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 从 IndexedDB 获取图片
  private async getImage(id: string): Promise<string | null> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.imageStoreName], "readonly");
      const store = transaction.objectStore(this.imageStoreName);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          this.blobToBase64(request.result.data).then(resolve).catch(reject);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 删除图片
  private async deleteImage(id: string): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.imageStoreName], "readwrite");
      const store = transaction.objectStore(this.imageStoreName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 清理旧数据
  protected async cleanupOldData(): Promise<void> {
    try {
      const calendars = await this.getAll();
      if (calendars.length >= this.maxCalendars) {
        // 按创建时间排序，删除最旧的
        calendars.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        const toDelete = calendars.slice(
          0,
          calendars.length - this.maxCalendars + 1
        );

        for (const cal of toDelete) {
          await this.delete(cal.id);
        }
      }
    } catch (error) {
      console.error("清理旧数据失败:", error);
    }
  }

  // 重写保存方法，处理图片数据
  async save(calendar: Calendar): Promise<boolean> {
    try {
      const db = await this.initDB();

      // 保存封面图片
      await this.saveImage(`cover_${calendar.id}`, calendar.cover);

      // 保存页面图片
      for (let i = 0; i < calendar.pages.length; i++) {
        await this.saveImage(`page_${calendar.id}_${i}`, calendar.pages[i]);
      }

      // 保存日历元数据
      const calendarData = {
        id: calendar.id,
        timestamp: Date.now(),
        coverId: `cover_${calendar.id}`,
        pageIds: calendar.pages.map((_, i) => `page_${calendar.id}_${i}`),
        pageCount: calendar.pages.length,
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [this.config.storeName],
          "readwrite"
        );
        const store = transaction.objectStore(this.config.storeName);
        const request = store.put(calendarData);

        request.onsuccess = async () => {
          await this.cleanupOldData();
          resolve(true);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("保存日历失败:", error);
      return false;
    }
  }

  // 获取单个日历
  async get(id: string): Promise<Calendar | null> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.config.storeName], "readonly");
        const store = transaction.objectStore(this.config.storeName);
        const request = store.get(id);

        request.onsuccess = async () => {
          if (!request.result) {
            resolve(null);
            return;
          }

          try {
            const data = request.result;

            // 获取封面图片
            const cover = await this.getImage(data.coverId);
            if (!cover) {
              resolve(null);
              return;
            }

            // 获取页面图片
            const pages: string[] = [];
            for (const pageId of data.pageIds) {
              const page = await this.getImage(pageId);
              if (page) {
                pages.push(page);
              }
            }

            resolve({
              id: data.id,
              cover,
              pages,
            });
          } catch (error) {
            reject(error);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("获取日历失败:", error);
      return null;
    }
  }

  // 重写获取所有方法，处理图片数据
  async getAll(): Promise<Calendar[]> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.config.storeName], "readonly");
        const store = transaction.objectStore(this.config.storeName);
        const request = store.getAll();

        request.onsuccess = async () => {
          try {
            const calendars: Calendar[] = [];
            for (const data of request.result) {
              const calendar = await this.get(data.id);
              if (calendar) {
                calendars.push(calendar);
              }
            }
            resolve(calendars);
          } catch (error) {
            reject(error);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("获取所有日历失败:", error);
      return [];
    }
  }

  // 删除日历
  async delete(id: string): Promise<boolean> {
    try {
      const db = await this.initDB();

      // 先获取日历数据以删除相关图片
      const calendar = await this.get(id);
      if (calendar) {
        // 删除封面图片
        await this.deleteImage(`cover_${id}`);

        // 删除页面图片
        for (let i = 0; i < calendar.pages.length; i++) {
          await this.deleteImage(`page_${id}_${i}`);
        }
      }

      // 删除日历元数据
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
      console.error("删除日历失败:", error);
      return false;
    }
  }

  // 清空所有日历
  async clear(): Promise<void> {
    try {
      const db = await this.initDB();

      // 清空日历存储
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(
          [this.config.storeName],
          "readwrite"
        );
        const store = transaction.objectStore(this.config.storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // 清空图片存储
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([this.imageStoreName], "readwrite");
        const store = transaction.objectStore(this.imageStoreName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("清空日历失败:", error);
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
      console.error("检查日历是否存在失败:", error);
      return false;
    }
  }

  // 获取存储的日历数量
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
      console.error("获取日历数量失败:", error);
      return 0;
    }
  }

  // 重写导出数据方法，处理图片数据
  async exportData(): Promise<string> {
    try {
      const calendars = await this.getAll();
      const exportData = {
        version: "1.0",
        timestamp: Date.now(),
        storeName: this.config.storeName,
        data: calendars,
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("导出数据失败:", error);
      throw error;
    }
  }

  // 重写导入数据方法，处理图片数据
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
      for (const calendar of importData.data) {
        if (calendar.id && calendar.cover && calendar.pages) {
          await this.save(calendar);
        }
      }

      return true;
    } catch (error) {
      console.error("导入数据失败:", error);
      return false;
    }
  }
}

// 导出 CalendarStorage 类
export { CalendarStorage };

// 导出单例实例（保持向后兼容）
export const calendarStorage = new CalendarStorage();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.calendarStorage = calendarStorage;
