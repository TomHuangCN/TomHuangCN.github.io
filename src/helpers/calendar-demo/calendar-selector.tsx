import { Calendar } from "./calendar-demo-storage";

interface CalendarSelectorProps {
  calendars: Calendar[];
  selectedId: string | null;
  aspectRatio: number; // 添加宽高比参数
  onSelect: (cal: Calendar) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

export default function CalendarSelector({
  calendars,
  selectedId,
  aspectRatio,
  onSelect,
  onDelete,
  onCreateNew,
}: CalendarSelectorProps) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {/* 新建日历按钮 - 只在有日历时显示 */}
      {calendars.length > 0 && (
        <div
          onClick={onCreateNew}
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
          onClick={() => onSelect(cal)}
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
