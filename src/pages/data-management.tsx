import React, { useRef, useState } from "react";
import { storageManager } from "../helpers/storage";

export function formatDateTimeForFilename(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "_" +
    pad(date.getHours()) +
    "-" +
    pad(date.getMinutes()) +
    "-" +
    pad(date.getSeconds())
  );
}

/**
 * 生成带时间戳的文件名
 */
export function generateTimestampedFilename(filename: string): string {
  const now = new Date();
  const formatted = formatDateTimeForFilename(now);

  if (filename.endsWith(".json")) {
    return filename.replace(/\.json$/, "") + "_" + formatted + ".json";
  }
  return filename + "_" + formatted + ".json";
}

interface ProgressState {
  isVisible: boolean;
  progress: number;
  message: string;
}

const DataManagement: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<ProgressState>({
    isVisible: false,
    progress: 0,
    message: "",
  });

  // 更新进度
  const updateProgress = (progress: number, message: string) => {
    setProgress({
      isVisible: true,
      progress,
      message,
    });
  };

  // 隐藏进度条
  const hideProgress = () => {
    setProgress({
      isVisible: false,
      progress: 0,
      message: "",
    });
  };

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

  const containerStyle: React.CSSProperties = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#333",
  };

  const sectionStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#555",
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#666",
    marginBottom: "15px",
    lineHeight: "1.5",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginRight: "10px",
    transition: "all 0.2s ease",
  };

  const exportButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "#4CAF50",
    color: "white",
  };

  const importButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "#2196F3",
    color: "white",
  };

  const clearButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "#f44336",
    color: "white",
  };

  const progressBarStyle: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 1000,
    minWidth: "300px",
  };

  const progressBarContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "20px",
    backgroundColor: "#f0f0f0",
    borderRadius: "10px",
    overflow: "hidden",
    margin: "10px 0",
  };

  const progressBarFillStyle: React.CSSProperties = {
    height: "100%",
    backgroundColor: "#4CAF50",
    transition: "width 0.3s ease",
    width: `${progress.progress}%`,
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>数据管理</h1>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>导出数据</h2>
        <p style={descriptionStyle}>
          将当前所有存储的数据导出为JSON文件，包含所有工作项目的配置和设置。
        </p>
        <button onClick={handleExport} style={exportButtonStyle}>
          导出数据
        </button>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>导入数据</h2>
        <p style={descriptionStyle}>
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
          style={importButtonStyle}
        >
          选择文件并导入
        </button>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>清空数据</h2>
        <p style={descriptionStyle}>
          删除所有存储的数据，包括所有工作项目的配置和设置。此操作不可恢复，请谨慎使用。
        </p>
        <button onClick={handleClear} style={clearButtonStyle}>
          清空所有数据
        </button>
      </div>

      {progress.isVisible && (
        <>
          <div style={overlayStyle} />
          <div style={progressBarStyle}>
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              {progress.message}
            </div>
            <div style={progressBarContainerStyle}>
              <div style={progressBarFillStyle} />
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#666",
              }}
            >
              {progress.progress}%
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DataManagement;
