import React, { useRef } from "react";
import { storageManager } from "../../helpers/storage";
import { generateTimestampedFilename } from "./utils";

interface DataManagementProps {
  updateProgress: (progress: number, message: string) => void;
  hideProgress: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  updateProgress,
  hideProgress,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 导出所有数据
  const handleExport = async () => {
    try {
      updateProgress(10, "准备导出数据...");

      updateProgress(30, "收集存储数据...");
      const data = await storageManager.exportAllData();

      updateProgress(70, "生成文件...");

      updateProgress(90, "下载文件...");
      storageManager.downloadData(
        `${generateTimestampedFilename("storage-backup")}.json`,
        data
      );

      updateProgress(100, "导出完成！");
      setTimeout(() => {
        hideProgress();
      }, 1000);
    } catch (error) {
      console.error("导出失败:", error);
      alert("导出失败，请重试");
      hideProgress();
    }
  };

  // 导入数据
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      updateProgress(10, "读取文件...");
      const data = await storageManager.readFileData(file);

      updateProgress(30, "验证数据格式...");
      const importData = JSON.parse(data);
      if (!importData.storages || typeof importData.storages !== "object") {
        throw new Error("无效的数据格式");
      }

      updateProgress(50, "导入数据...");
      const success = await storageManager.importAllData(data);

      if (success) {
        updateProgress(90, "导入成功！");
        setTimeout(() => {
          hideProgress();
          alert("导入成功！");
          // 刷新页面以显示新数据
          window.location.reload();
        }, 1000);
      } else {
        throw new Error("导入失败");
      }
    } catch (error) {
      console.error("导入失败:", error);
      alert("导入失败，请检查文件格式");
      hideProgress();
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 清空所有数据
  const handleClear = () => {
    if (confirm("确定要清空所有数据吗？此操作不可恢复！")) {
      const storageNames = storageManager.getAllStorageNames();
      Promise.all(
        storageNames.map(name => {
          const storage = storageManager.get(name);
          return storage?.clear();
        })
      )
        .then(() => {
          alert("数据清空成功！");
          window.location.reload();
        })
        .catch(error => {
          console.error("清空数据失败:", error);
          window.alert("清空数据失败，请重试");
        });
    }
  };

  return (
    <div>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>导出数据</h2>
        <p style={styles.description}>
          将当前所有存储的数据导出为JSON文件，包含所有工作项目的配置和设置。
        </p>
        <button onClick={handleExport} style={styles.exportButton}>
          导出数据
        </button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>导入数据</h2>
        <p style={styles.description}>
          从之前导出的JSON文件中恢复数据。这将覆盖当前的所有数据。
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={styles.importButton}
        >
          选择文件并导入
        </button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>清空数据</h2>
        <p style={styles.description}>
          删除所有存储的数据，包括所有工作项目的配置和设置。此操作不可恢复，请谨慎使用。
        </p>
        <button onClick={handleClear} style={styles.clearButton}>
          清空所有数据
        </button>
      </div>
    </div>
  );
};

const styles = {
  section: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#555",
  } as React.CSSProperties,

  description: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "15px",
    lineHeight: "1.5",
  } as React.CSSProperties,

  exportButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginRight: "10px",
    transition: "all 0.2s ease",
    background: "#4CAF50",
    color: "white",
  } as React.CSSProperties,

  importButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginRight: "10px",
    transition: "all 0.2s ease",
    background: "#2196F3",
    color: "white",
  } as React.CSSProperties,

  clearButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginRight: "10px",
    transition: "all 0.2s ease",
    background: "#f44336",
    color: "white",
  } as React.CSSProperties,
};
