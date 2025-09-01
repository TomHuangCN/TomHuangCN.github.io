import React, { useState, useCallback, useRef } from "react";
import type { TemplatePage, Template } from "./types";

interface TemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pages: TemplatePage[], templateName: string) => void;
  maxPages: number;
  pageWidth: number; // 页面宽度（像素）
  pageHeight: number; // 页面高度（像素）
  editingTemplate?: Template | null; // 编辑的模板（可选）
}

interface PageEditorProps {
  page: TemplatePage;
  onUpdate: (page: TemplatePage) => void;
}

// 单页编辑器组件
function PageEditor({ page, onUpdate }: PageEditorProps) {
  const [templateImage, setTemplateImage] = useState(page.templateImage);
  const [startX, setStartX] = useState(page.startX);
  const [startY, setStartY] = useState(page.startY);
  const [pictureWidth, setPictureWidth] = useState(page.pictureWidth);
  const [pictureHeight, setPictureHeight] = useState(page.pictureHeight);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = e => {
        const url = e.target?.result as string;
        setTemplateImage(url);
        onUpdate({ ...page, templateImage: url });
      };
      reader.readAsDataURL(file);
    },
    [page, onUpdate]
  );

  const handleInputChange = useCallback(
    (field: keyof TemplatePage, value: number) => {
      const newPage = { ...page, [field]: value };
      onUpdate(newPage);

      // 更新本地状态
      switch (field) {
        case "startX":
          setStartX(value);
          break;
        case "startY":
          setStartY(value);
          break;
        case "pictureWidth":
          setPictureWidth(value);
          break;
        case "pictureHeight":
          setPictureHeight(value);
          break;
      }
    },
    [page, onUpdate]
  );

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: "#f9f9f9",
        height: "fit-content",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h4 style={{ margin: 0 }}>页面 {page.id}</h4>
      </div>

      {/* 模板图片选择和预览 */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
        >
          模板图片:
        </label>

        {/* 页面尺寸信息 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            padding: "8px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          <span>
            页面尺寸: {page.width} × {page.height} px
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div style={{ position: "relative" }}>
            {(() => {
              const maxPreviewSize = 120; // 最大预览尺寸
              const pageAspectRatio = page.width / page.height;

              let previewWidth, previewHeight;
              if (pageAspectRatio > 1) {
                // 横向页面
                previewWidth = maxPreviewSize;
                previewHeight = maxPreviewSize / pageAspectRatio;
              } else {
                // 纵向页面
                previewHeight = maxPreviewSize;
                previewWidth = maxPreviewSize * pageAspectRatio;
              }

              return (
                <>
                  {templateImage ? (
                    <img
                      src={templateImage}
                      alt="模板预览"
                      style={{
                        width: `${previewWidth}px`,
                        height: `${previewHeight}px`,
                        objectFit: "cover",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: `${previewWidth}px`,
                        height: `${previewHeight}px`,
                        backgroundColor: "#f0f0f0",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                        fontSize: "12px",
                      }}
                    >
                      空白模板
                    </div>
                  )}
                  {/* 预览 picture 位置 */}
                  <div
                    style={{
                      position: "absolute",
                      left: `${startX}%`, // 使用百分比定位
                      top: `${startY}%`, // 使用百分比定位
                      width: `${pictureWidth}%`, // 使用百分比尺寸
                      height: `${pictureHeight}%`, // 使用百分比尺寸
                      border: "2px solid #ff4444",
                      backgroundColor: "rgba(255, 68, 68, 0.3)",
                      borderRadius: "2px",
                      pointerEvents: "none",
                    }}
                    title={`用户图片位置: (${startX}%, ${startY}%) ${pictureWidth}%×${pictureHeight}%`}
                  />
                </>
              );
            })()}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleImageChange(file);
            }}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {templateImage ? "更换图片" : "选择图片"}
          </button>
        </div>
      </div>

      {/* 坐标和尺寸设置 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
        <div>
          <label
            style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}
          >
            起始 X 坐标 (%):
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={startX}
            onChange={e => {
              const value = parseInt(e.target.value) || 0;
              const clampedValue = Math.max(0, Math.min(100, value));
              handleInputChange("startX", clampedValue);
            }}
            style={{
              width: "100%",
              padding: "6px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}
          >
            起始 Y 坐标 (%):
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={startY}
            onChange={e => {
              const value = parseInt(e.target.value) || 0;
              const clampedValue = Math.max(0, Math.min(100, value));
              handleInputChange("startY", clampedValue);
            }}
            style={{
              width: "100%",
              padding: "6px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}
          >
            图片宽度 (%):
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={pictureWidth}
            onChange={e => {
              const value = parseInt(e.target.value) || 0;
              const clampedValue = Math.max(0, Math.min(100, value));
              handleInputChange("pictureWidth", clampedValue);
            }}
            style={{
              width: "100%",
              padding: "6px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "4px", fontSize: "14px" }}
          >
            图片高度 (%):
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={pictureHeight}
            onChange={e => {
              const value = parseInt(e.target.value) || 0;
              const clampedValue = Math.max(0, Math.min(100, value));
              handleInputChange("pictureHeight", clampedValue);
            }}
            style={{
              width: "100%",
              padding: "6px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// 主模板编辑器组件
export default function TemplateEditor({
  isOpen,
  onClose,
  onSave,
  maxPages,
  pageWidth,
  pageHeight,
  editingTemplate,
}: TemplateEditorProps) {
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [templateName, setTemplateName] = useState("");

  // 初始化页面
  React.useEffect(() => {
    if (isOpen) {
      if (editingTemplate) {
        // 编辑现有模板
        setPages(editingTemplate.pages);
        setTemplateName(editingTemplate.name);
      } else {
        // 创建新模板
        const initialPages: TemplatePage[] = Array.from(
          { length: maxPages },
          (_, index) => ({
            id: `page_${index + 1}`,
            width: pageWidth, // 使用传入的页面宽度
            height: pageHeight, // 使用传入的页面高度
            templateImage: "",
            startX: 0, // 默认从 0% 开始
            startY: 0, // 默认从 0% 开始
            pictureWidth: 100, // 默认图片宽度 100%
            pictureHeight: 100, // 默认图片高度 100%
          })
        );
        setPages(initialPages);
        setTemplateName("");
      }
    }
  }, [isOpen, maxPages, pageWidth, pageHeight, editingTemplate]);

  const handlePageUpdate = useCallback(
    (index: number, updatedPage: TemplatePage) => {
      setPages(prev =>
        prev.map((page, i) => (i === index ? updatedPage : page))
      );
    },
    []
  );

  const handleAddPage = useCallback(() => {
    if (pages.length < maxPages) {
      const newPage: TemplatePage = {
        id: `page_${pages.length + 1}`,
        width: pageWidth, // 使用传入的页面宽度
        height: pageHeight, // 使用传入的页面高度
        templateImage: "",
        startX: 0, // 默认从 0% 开始
        startY: 0, // 默认从 0% 开始
        pictureWidth: 100, // 默认图片宽度 100%
        pictureHeight: 100, // 默认图片高度 100%
      };
      setPages(prev => [...prev, newPage]);
    }
  }, [pages.length, maxPages, pageWidth, pageHeight]);

  const handleSave = useCallback(() => {
    if (!templateName.trim()) {
      alert("请输入模板名称");
      return;
    }

    onSave(pages, templateName);
    onClose();
  }, [templateName, pages, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "auto",
          width: "90%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ margin: 0 }}>
            {editingTemplate ? "编辑模板" : "创建新模板"}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              backgroundColor: "transparent",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* 模板名称 */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            模板名称:
          </label>
          <input
            type="text"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            placeholder="请输入模板名称"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
        </div>

        {/* 页面编辑器列表 */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ margin: 0 }}>页面设置</h3>
            {pages.length < maxPages && (
              <button
                onClick={handleAddPage}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                添加页面
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {pages.map((page, index) => (
              <PageEditor
                key={page.id}
                page={page}
                onUpdate={updatedPage => handlePageUpdate(index, updatedPage)}
              />
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "12px 24px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {editingTemplate ? "更新模板" : "保存模板"}
          </button>
        </div>
      </div>
    </div>
  );
}
