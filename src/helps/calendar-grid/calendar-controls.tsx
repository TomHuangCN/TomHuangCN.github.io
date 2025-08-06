import React from "react";
import { CalendarControlsProps } from "./types";
import { fontOptions, commonStyles } from "./constants";

export const CalendarControls: React.FC<CalendarControlsProps> = ({
  year,
  setYear,
  startDay,
  setStartDay,
  showMonthTitle,
  setShowMonthTitle,
  selectedFont,
  setSelectedFont,
  isDownloading,
  onDownload,
}) => {
  return (
    <div
      className="calendar-controls"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "left",
        gap: "16px",
        background: "#f8f8f8",
        borderRadius: "8px",
        padding: "18px 20px 10px 20px",
        marginBottom: "18px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <label
          htmlFor="year-input"
          style={{ fontSize: "15px", color: "#606266" }}
        >
          年份
        </label>
        <input
          id="year-input"
          type="number"
          value={year}
          onChange={e =>
            setYear(parseInt(e.target.value) || new Date().getFullYear())
          }
          min={1}
          max={9999}
          style={{
            ...commonStyles.input,
            width: "90px",
            textAlign: "center",
            fontSize: "18px",
            padding: "4px 8px",
            borderRadius: "5px",
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <label
          htmlFor="startday-select"
          style={{ fontSize: "15px", color: "#606266" }}
        >
          起始日
        </label>
        <select
          id="startday-select"
          value={startDay}
          onChange={e => setStartDay(parseInt(e.target.value))}
          style={{
            ...commonStyles.select,
            minWidth: "90px",
            borderRadius: "5px",
            padding: "4px 8px",
          }}
        >
          <option value={0}>周日开始</option>
          <option value={1}>周一开始</option>
        </select>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={() => setShowMonthTitle(!showMonthTitle)}
          style={{
            ...commonStyles.button,
            minWidth: "90px",
            borderRadius: "5px",
            padding: "4px 12px",
            fontSize: "15px",
            background: showMonthTitle ? "#e6f7ff" : "#f0f0f0",
            color: showMonthTitle ? "#1890ff" : "#606266",
            border: showMonthTitle ? "1px solid #91d5ff" : "1px solid #d9d9d9",
            transition: "all 0.2s",
          }}
        >
          {showMonthTitle ? "隐藏月份" : "显示月份"}
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <label
          htmlFor="font-select"
          style={{ fontSize: "15px", color: "#606266" }}
        >
          字体
        </label>
        <select
          id="font-select"
          value={selectedFont}
          onChange={e => setSelectedFont(e.target.value)}
          style={{
            ...commonStyles.select,
            minWidth: "120px",
            borderRadius: "5px",
            padding: "4px 8px",
          }}
        >
          {fontOptions.map(font => (
            <option key={font.name} value={font.value}>
              {font.displayName}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={onDownload}
          disabled={isDownloading}
          style={{
            ...commonStyles.button,
            minWidth: "100px",
            borderRadius: "5px",
            padding: "6px 16px",
            fontSize: "15px",
            background: isDownloading ? "#f5f5f5" : "#1890ff",
            color: isDownloading ? "#aaa" : "#fff",
            border: isDownloading ? "1px solid #d9d9d9" : "1px solid #1890ff",
            cursor: isDownloading ? "not-allowed" : "pointer",
            opacity: isDownloading ? 0.7 : 1,
            transition: "all 0.2s",
          }}
        >
          {isDownloading ? "生成中..." : "下载图片"}
        </button>
      </div>
    </div>
  );
};
