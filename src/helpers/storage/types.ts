// ============================================================================
// Storage 类型定义
// ============================================================================

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

export interface ExportData {
  version: string;
  timestamp: number;
  storeName: string;
  data: StorageData[];
}

export interface AllExportData {
  version: string;
  timestamp: number;
  compressed?: boolean;
  storages: Record<string, string>;
}
