import React, { useRef, useState } from "react";
import { storageManager } from "../utils/storage";

interface ProgressState {
  isVisible: boolean;
  progress: number;
  message: string;
}

const StorageControls: React.FC = () => {
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
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");

      updateProgress(90, "下载文件...");
      storageManager.downloadData(`storage-backup-${timestamp}.json`, data);

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

  const buttonStyle: React.CSSProperties = {
    padding: "6px 12px",
    margin: "0 4px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "12px",
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
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={handleExport} style={buttonStyle}>
          导出数据
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={buttonStyle}
        >
          导入数据
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
    </>
  );
};

export default StorageControls;
