import React from "react";
import type { CalendarImage } from "./calendar-gen";

interface ImageSelectorProps {
  images: CalendarImage[];
  setImages: React.Dispatch<React.SetStateAction<CalendarImage[]>>;
  maxImages: number;
  onImageReplace?: (images: CalendarImage[]) => void;
}

function fileToUrl(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

export default function ImageSelector({
  images,
  setImages,
  maxImages,
  onImageReplace,
}: ImageSelectorProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  // 批量上传
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, maxImages);
    Promise.all(arr.map(f => fileToUrl(f))).then(urls => {
      const newImages = urls.map((url, i) => ({ url, file: arr[i] }));
      setImages(newImages);
      // 通知父组件图片已更新，需要更新storage
      onImageReplace?.(newImages);
    });
  };

  // 单张替换
  const handleReplace = (idx: number, file: File) => {
    fileToUrl(file).then(url => {
      const newImages = images.map((img, i) =>
        i === idx ? { url, file } : img
      );
      setImages(newImages);
      // 通知父组件图片已替换，需要更新storage
      onImageReplace?.(newImages);
    });
  };

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
      {Array.from({ length: maxImages }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 60,
            height: 80,
            border: "1px solid #ccc",
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {images[i]?.url ? (
            <>
              <img
                src={images[i].url}
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
                lineHeight: "80px",
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
