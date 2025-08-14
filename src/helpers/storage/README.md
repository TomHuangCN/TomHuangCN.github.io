# Storage 模块

这个模块提供了基于 IndexedDB 的存储解决方案，包含基础存储类、存储管理器和相关工具函数。

## 文件结构

```
src/helpers/storage/
├── index.ts              # 模块入口文件，导出所有功能
├── types.ts              # 类型定义
├── base-storage.ts       # 基础存储抽象类
├── storage-manager.ts    # 存储管理器类
├── utils.ts              # 工具函数
└── README.md             # 说明文档
```

## 主要组件

### 1. 类型定义 (`types.ts`)
- `StorageData`: 存储数据的基础接口
- `StorageConfig`: 存储配置接口
- `ExportData`: 导出数据结构
- `AllExportData`: 批量导出数据结构

### 2. 基础存储类 (`base-storage.ts`)
- `BaseStorage<T>`: 抽象基类，提供 CRUD 操作
- 支持数据库初始化、数据管理、导入导出等功能

### 3. 存储管理器 (`storage-manager.ts`)
- `StorageManager`: 单例类，管理多个存储实例
- 提供统一的存储访问接口和批量操作

### 4. 工具函数 (`utils.ts`)
- `formatDateTimeForFilename()`: 格式化日期时间
- `generateTimestampedFilename()`: 生成带时间戳的文件名

## 使用示例

```typescript
import { BaseStorage, StorageManager, storageManager } from '../helpers/storage';

// 创建自定义存储类
class MyStorage extends BaseStorage<MyData> {
  constructor() {
    super({
      dbName: 'myApp',
      storeName: 'myData',
      maxItems: 50
    });
  }
}

// 注册存储实例
const myStorage = new MyStorage();
storageManager.register('myData', myStorage);

// 使用存储
await myStorage.save({ id: '1', name: 'test' });
const data = await myStorage.get('1');
```

## 特性

- **类型安全**: 完整的 TypeScript 支持
- **模块化设计**: 清晰的职责分离
- **单例模式**: 统一的存储管理
- **错误处理**: 完善的异常处理机制
- **数据清理**: 自动清理旧数据
- **导入导出**: 支持数据备份和恢复
