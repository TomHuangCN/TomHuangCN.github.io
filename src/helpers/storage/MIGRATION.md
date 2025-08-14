# Storage 模块迁移指南

## 概述

Storage 模块已从 `src/utils/storage.ts` 重构到 `src/helpers/storage/` 目录，以更好地反映其作为辅助工具类的性质。

## 文件结构变化

### 重构前
```
src/utils/storage.ts  (单个文件，包含所有功能)
```

### 重构后
```
src/helpers/storage/
├── index.ts              # 模块入口文件
├── types.ts              # 类型定义
├── base-storage.ts       # 基础存储抽象类
├── storage-manager.ts    # 存储管理器类
├── utils.ts              # 工具函数
├── README.md             # 说明文档
└── MIGRATION.md          # 本迁移指南
```

## 导入路径更新

### 旧路径
```typescript
import { BaseStorage, StorageData, storageManager } from '../utils/storage';
```

### 新路径
```typescript
// 推荐：从入口文件导入
import { BaseStorage, StorageData, storageManager } from '../helpers/storage';

// 或者：直接从具体文件导入
import type { StorageData } from '../helpers/storage/types';
import { BaseStorage } from '../helpers/storage/base-storage';
import { storageManager } from '../helpers/storage/storage-manager';
```

## 向后兼容性

为了保持向后兼容性，`src/utils/storage.ts` 文件仍然存在，但它现在只是从新位置重新导出所有功能。这意味着：

- 现有的导入仍然可以工作
- 但建议更新到新的导入路径
- 新功能只会添加到新模块中

## 已更新的文件

以下文件已更新导入路径：

- `src/helpers/calendar-demo/calendar-demo-storage.ts`
- `src/pages/data-management.tsx`

## 重构优势

1. **更清晰的架构**: 类和方法按功能分组
2. **更好的可维护性**: 每个文件职责单一
3. **更合适的目录结构**: 作为辅助工具类放在 `helpers` 目录
4. **类型安全**: 完整的 TypeScript 支持
5. **模块化**: 可以按需导入特定功能

## 迁移步骤

1. 更新导入路径从 `../utils/storage` 到 `../helpers/storage`
2. 测试功能是否正常工作
3. 删除旧的导入路径引用

## 注意事项

- 所有现有的 API 保持不变
- 类型定义完全兼容
- 单例实例 `storageManager` 仍然可用
- 构建和运行时行为完全一致
