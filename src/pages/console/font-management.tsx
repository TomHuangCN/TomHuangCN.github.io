import React, { useState, useRef, useEffect } from "react";
import {
  FontStorage,
  type CustomFontData,
} from "../../helpers/storage/font-storage";
import { addCustomFont, removeCustomFont } from "../../utils/font-loader";

interface FontManagementProps {
  updateProgress?: (progress: number, message: string) => void;
  hideProgress?: () => void;
}

export const FontManagement: React.FC<FontManagementProps> = ({
  updateProgress,
  hideProgress,
}) => {
  const [customFonts, setCustomFonts] = useState<CustomFontData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontStorage = useRef(new FontStorage());

  // 加载自定义字体列表
  const loadCustomFonts = async () => {
    try {
      const fonts = await fontStorage.current.getAllCustomFonts();
      setCustomFonts(fonts);
    } catch (error) {
      console.error("加载自定义字体失败:", error);
    }
  };

  useEffect(() => {
    loadCustomFonts();
  }, []);

  // 处理文件上传
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError("");

    try {
      for (const file of Array.from(files)) {
        await uploadSingleFont(file);
      }

      // 重新加载字体列表
      await loadCustomFonts();

      if (updateProgress) {
        updateProgress(100, "字体上传完成");
        setTimeout(() => {
          if (hideProgress) hideProgress();
        }, 1000);
      }
    } catch (error) {
      console.error("字体上传失败:", error);
      setUploadError(error instanceof Error ? error.message : "上传失败");
    } finally {
      setIsUploading(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 上传单个字体文件
  const uploadSingleFont = async (file: File) => {
    // 验证文件类型
    const allowedTypes = [
      "font/ttf",
      "font/otf",
      "font/woff",
      "font/woff2",
      "application/font-woff",
      "application/font-woff2",
      "application/x-font-ttf",
      "application/x-font-otf",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(ttf|otf|woff|woff2)$/i)
    ) {
      throw new Error(`不支持的文件类型: ${file.type || file.name}`);
    }

    // 检查文件大小（限制30MB）
    const maxSize = 30 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(
        `文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(1)}MB > 30MB`
      );
    }

    // 生成字体名称（基于文件名）
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    const fontName = `custom-${fileName}`;
    const displayName = fileName;

    // 检查字体名称是否已存在
    const exists = await fontStorage.current.isFontNameExists(fontName);
    if (exists) {
      throw new Error(`字体名称已存在: ${displayName}`);
    }

    // 读取文件并转换为base64
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = "";

    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }

    const base64 = btoa(binaryString);

    // 确定字体格式
    let format = "truetype";
    if (file.name.toLowerCase().endsWith(".woff")) {
      format = "woff";
    } else if (file.name.toLowerCase().endsWith(".woff2")) {
      format = "woff2";
    } else if (file.name.toLowerCase().endsWith(".otf")) {
      format = "opentype";
    }

    // 保存到IndexedDB
    const success = await fontStorage.current.saveCustomFont(
      fontName,
      displayName,
      base64,
      format,
      file.size
    );

    if (!success) {
      throw new Error("保存字体到数据库失败");
    }

    // 添加到字体加载器
    addCustomFont(fontName, base64, format);

    console.log(`字体 ${displayName} 上传成功`);
  };

  // 删除字体
  const handleDeleteFont = async (fontName: string) => {
    if (!confirm("确定要删除这个字体吗？")) return;

    try {
      const success = await fontStorage.current.deleteCustomFont(fontName);
      if (success) {
        // 从字体加载器中移除
        removeCustomFont(fontName);
        await loadCustomFonts();
        console.log(`字体 ${fontName} 删除成功`);
      } else {
        alert("删除字体失败");
      }
    } catch (error) {
      console.error("删除字体失败:", error);
      alert("删除字体失败");
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString("zh-CN");
  };

  return (
    <div>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>字体上传</h2>
        <p style={styles.description}>
          上传自定义字体文件，支持 TTF、OTF、WOFF、WOFF2 格式，单个文件最大
          30MB。
        </p>

        <div style={styles.uploadArea}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
            onChange={handleFileUpload}
            disabled={isUploading}
            style={{ display: "none" }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              ...styles.button,
              background: isUploading ? "#ccc" : "#4CAF50",
              color: "white",
              cursor: isUploading ? "not-allowed" : "pointer",
            }}
          >
            {isUploading ? "上传中..." : "选择字体文件"}
          </button>

          {uploadError && <div style={styles.errorMessage}>{uploadError}</div>}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>已上传的字体</h2>
        <p style={styles.description}>
          管理已上传的自定义字体，可以删除不需要的字体。
        </p>

        {customFonts.length === 0 ? (
          <div style={styles.emptyState}>暂无自定义字体</div>
        ) : (
          <div style={styles.fontList}>
            {customFonts.map(font => (
              <div key={font.id} style={styles.fontItem}>
                <div style={styles.fontInfo}>
                  <div style={styles.fontName}>{font.displayName}</div>
                  <div style={styles.fontDetails}>
                    <span>格式: {font.format}</span>
                    <span>大小: {formatFileSize(font.size)}</span>
                    <span>上传时间: {formatTime(font.uploadTime)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFont(font.name)}
                  style={{
                    ...styles.button,
                    background: "#f44336",
                    color: "white",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
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

  uploadArea: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },

  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  } as React.CSSProperties,

  errorMessage: {
    color: "#f44336",
    fontSize: "14px",
    padding: "8px 12px",
    backgroundColor: "#ffebee",
    borderRadius: "4px",
    border: "1px solid #ffcdd2",
  } as React.CSSProperties,

  emptyState: {
    textAlign: "center" as const,
    color: "#999",
    fontSize: "14px",
    padding: "40px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
  } as React.CSSProperties,

  fontList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },

  fontItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  } as React.CSSProperties,

  fontInfo: {
    flex: 1,
  },

  fontName: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
    marginBottom: "4px",
  } as React.CSSProperties,

  fontDetails: {
    fontSize: "12px",
    color: "#666",
    display: "flex",
    gap: "16px",
  } as React.CSSProperties,
};
