import React, { useCallback } from "react";
import type { UserImage } from "./types";

interface PictureSelectorProps {
  pictures: UserImage[];
  setPictures: React.Dispatch<React.SetStateAction<UserImage[]>>;
  maxPages: number;
  aspectRatio: number; // 接收宽高比参数
  onPictureReplace?: (pictures: UserImage[]) => void;
  templateMode?: boolean;
  templateAspectRatio?: number; // 模板模式下的宽高比
}

function fileToUrl(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

export default function PictureSelector({
  pictures,
  setPictures,
  maxPages,
  aspectRatio,
  onPictureReplace,
  templateMode = false,
  templateAspectRatio,
}: PictureSelectorProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  // 使用模板模式下的宽高比或默认宽高比
  const currentAspectRatio =
    templateMode && templateAspectRatio ? templateAspectRatio : aspectRatio;

  // 批量上传
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const arr = Array.from(files).slice(0, maxPages);
      Promise.all(arr.map(f => fileToUrl(f))).then(urls => {
        const newPictures = urls.map((url, i) => ({
          url,
          file: arr[i],
          aspectRatio: currentAspectRatio,
        }));
        setPictures(newPictures);
        // 批量上传时立即通知父组件更新存储
        onPictureReplace?.(newPictures);
      });
    },
    [maxPages, setPictures, onPictureReplace, currentAspectRatio]
  );

  // 单张替换 - 优化版本
  const handleReplace = useCallback(
    (idx: number, file: File) => {
      fileToUrl(file).then(url => {
        const newPictures = pictures.map((img, i) =>
          i === idx ? { url, file, aspectRatio: currentAspectRatio } : img
        );
        setPictures(newPictures);
        // 单张替换时通知父组件更新存储（会触发防抖）
        onPictureReplace?.(newPictures);
      });
    },
    [pictures, setPictures, onPictureReplace, currentAspectRatio]
  );

  // 拖拽事件处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 16,
        padding: isDragOver ? "16px" : "0",
        border: isDragOver ? "2px dashed #007bff" : "none",
        borderRadius: isDragOver ? "8px" : "0",
        backgroundColor: isDragOver ? "rgba(0, 123, 255, 0.1)" : "transparent",
        transition: "all 0.2s ease",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 12px",
          fontSize: 12,
          background: "#f5f5f5",
          border: "1px solid #ccc",
          borderRadius: 4,
          cursor: "pointer",
          marginRight: 8,
          minWidth: 80,
        }}
      >
        <span style={{ textAlign: "center", width: "100%" }}>点击上传图片</span>
        <input
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => handleFiles(e.target.files)}
        />
      </label>
      {Array.from({ length: maxPages }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 60,
            height: 60 / aspectRatio,
            border: "1px solid #ccc",
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {pictures[i]?.url ? (
            <>
              <img
                src={pictures[i].url}
                alt="img"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <input
                type="file"
                accept="image/*"
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer",
                }}
                onChange={e =>
                  e.target.files && handleReplace(i, e.target.files[0])
                }
              />
            </>
          ) : (
            <span
              style={{
                color: "#aaa",
                fontSize: 12,
                lineHeight: `${60 / aspectRatio}px`,
                textAlign: "center",
                display: "block",
              }}
            >
              {i === 0 ? "封面" : `内页${i}`}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
