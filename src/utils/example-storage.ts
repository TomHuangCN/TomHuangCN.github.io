import {
  BaseStorage,
  StorageData,
  StorageConfig,
  storageManager,
} from "./storage";

// 示例数据接口
export interface ExampleData extends StorageData {
  title: string;
  content: string;
  tags: string[];
}

// 示例 Storage 类
export class ExampleStorage extends BaseStorage<ExampleData> {
  constructor() {
    const config: StorageConfig = {
      dbName: "ExampleDB",
      storeName: "examples",
      version: 1,
      maxItems: 50,
    };
    super(config);

    // 注册到 storage manager
    storageManager.register("example", this);
  }
}

// 导出单例实例
export const exampleStorage = new ExampleStorage();
