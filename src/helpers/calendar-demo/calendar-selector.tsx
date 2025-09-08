import { Calendar } from "./types";

interface CalendarSelectorProps {
  calendars: Calendar[];
  selectedId: string | null;
  aspectRatio: number; // 添加宽高比参数
  onSelect: (cal: Calendar) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onTemplateSync?: (templateId: string | null) => void; // 同步模板选择
  loading?: boolean; // 切换日历时的 loading 状态
}

export default function CalendarSelector({
  calendars,
  selectedId,
  aspectRatio,
  onSelect,
  onDelete,
  onCreateNew,
  onTemplateSync,
  loading = false,
}: CalendarSelectorProps) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      {/* Loading 状态显示 */}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #ddd",
            borderRadius: 4,
            width: 80,
            height: 80 / aspectRatio,
            backgroundColor: "#f8f9fa",
            color: "#666",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                border: "2px solid #007bff",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <span>切换中...</span>
          </div>
        </div>
      )}

      {/* 新建日历按钮 - 只在有日历时显示 */}
      {calendars.length > 0 && (
        <div
          onClick={() => {
            onCreateNew();
            // 新建日历时清除模板选择
            if (onTemplateSync) {
              onTemplateSync(null);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #ccc",
            borderRadius: 4,
            width: 80,
            height: 80 / aspectRatio,
            cursor: "pointer",
            color: "#666",
            fontSize: 12,
            textAlign: "center",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#007bff";
            e.currentTarget.style.color = "#007bff";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#ccc";
            e.currentTarget.style.color = "#666";
          }}
        >
          新建
        </div>
      )}

      {calendars.map(cal => (
        <div
          key={cal.id}
          style={{
            position: "relative",
            border:
              selectedId === cal.id ? "2px solid #007bff" : "1px solid #ccc",
            borderRadius: 4,
            overflow: "hidden",
            width: "fit-content",
            height: 80 / aspectRatio,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow:
              selectedId === cal.id ? "0 0 8px rgba(0, 123, 255, 0.3)" : "none",
          }}
          onClick={() => {
            onSelect(cal);
            // 同步切换对应的模板
            if (onTemplateSync && cal.templateId) {
              onTemplateSync(cal.templateId);
            } else if (onTemplateSync) {
              onTemplateSync(null);
            }
          }}
        >
          <img
            src={cal.cover}
            alt="cover"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <button
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              background: "red",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 20,
              height: 20,
              cursor: "pointer",
              fontSize: "14px",
              lineHeight: "1",
            }}
            onClick={e => {
              e.stopPropagation();
              onDelete(cal.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
