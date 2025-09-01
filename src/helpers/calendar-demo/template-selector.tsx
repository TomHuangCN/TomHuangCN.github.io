import React, { useState, useCallback } from "react";
import type { Template } from "./types";
import TemplateEditor from "./template-editor";

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId: string | null;
  onTemplateSelect: (templateId: string | null) => void;
  onTemplateCreate: (pages: Template["pages"], templateName: string) => void;
  onTemplateUpdate: (
    templateId: string,
    pages: Template["pages"],
    templateName: string
  ) => void;
  onTemplateDelete: (templateId: string) => void;
  maxPages: number;
  pageWidth: number; // 页面宽度（像素）
  pageHeight: number; // 页面高度（像素）
}

export default function TemplateSelector({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
  maxPages,
  pageWidth,
  pageHeight,
}: TemplateSelectorProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleCreateNew = useCallback(() => {
    setIsEditorOpen(true);
  }, []);

  const handleSaveTemplate = useCallback(
    (pages: Template["pages"], templateName: string) => {
      if (editingTemplate) {
        // 编辑现有模板
        onTemplateUpdate(editingTemplate.id, pages, templateName);
        setEditingTemplate(null);
      } else {
        // 创建新模板
        onTemplateCreate(pages, templateName);
      }
      setIsEditorOpen(false);
    },
    [editingTemplate, onTemplateCreate, onTemplateUpdate]
  );

  const handleTemplateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onTemplateSelect(value === "new" ? null : value);
    },
    [onTemplateSelect]
  );

  const handleEditTemplate = useCallback(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setEditingTemplate(template);
        setIsEditorOpen(true);
      }
    }
  }, [selectedTemplateId, templates]);

  const handleDeleteTemplate = useCallback(() => {
    if (selectedTemplateId && confirm("确定要删除这个模板吗？")) {
      onTemplateDelete(selectedTemplateId);
      onTemplateSelect(null); // 清除选择
    }
  }, [selectedTemplateId, onTemplateDelete, onTemplateSelect]);

  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}
      >
        选择模板:
      </label>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <select
          value={selectedTemplateId || "new"}
          onChange={handleTemplateChange}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
            minWidth: "200px",
          }}
        >
          <option value="new">空</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>

        {selectedTemplateId === null ? (
          <button
            onClick={handleCreateNew}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            创建模板
          </button>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleEditTemplate}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              编辑模板
            </button>
            <button
              onClick={handleDeleteTemplate}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              删除模板
            </button>
          </div>
        )}
      </div>

      {/* 模板编辑器 */}
      <TemplateEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
        maxPages={maxPages}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        editingTemplate={editingTemplate}
      />
    </div>
  );
}
