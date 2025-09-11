import React, { useState, useRef, useEffect } from "react";
import { CalendarControlsProps } from "./types";
import { baseFontOptions, getAllFontOptions, commonStyles } from "./constants";
import { fontStatusManager } from "./font-status-manager";
import { loadCustomFonts } from "../../utils/font-loader";

// 字体选择器组件
const FontSelector: React.FC<{
  selectedFont: string;
  onFontSelect: (font: string) => void;
}> = ({ selectedFont, onFontSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fonts, setFonts] = useState(baseFontOptions);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 加载所有字体选项（包括自定义字体）
  useEffect(() => {
    const loadFonts = async () => {
      try {
        // 先确保自定义字体已加载到CSS中
        await loadCustomFonts();
        // 然后获取所有字体选项
        const allFonts = await getAllFontOptions();
        setFonts(allFonts);
        console.log("字体选择器加载完成，共", allFonts.length, "个字体");
      } catch (error) {
        console.error("加载字体选项失败:", error);
        setFonts(baseFontOptions);
      }
    };

    loadFonts();
  }, []);

  // 订阅字体状态变化
  useEffect(() => {
    const unsubscribe = fontStatusManager.subscribe(setFonts);
    return unsubscribe;
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedFontOption = fonts.find(font => font.value === selectedFont);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...commonStyles.select,
          minWidth: "120px",
          borderRadius: "5px",
          padding: "4px 8px",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#FFFFFF",
        }}
      >
        <span>{selectedFontOption?.displayName || "选择字体"}</span>
        <span style={{ fontSize: "12px", color: "#999" }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#FFFFFF",
            border: "1px solid #D7D9E0",
            borderRadius: "5px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 1000,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {fonts.map(font => (
            <div
              key={font.name}
              onClick={() => {
                onFontSelect(font.value);
                setIsOpen(false);
              }}
              style={{
                padding: "8px 12px",
                cursor: font.isLoaded ? "pointer" : "not-allowed",
                background:
                  font.value === selectedFont ? "#f0f8ff" : "transparent",
                color: font.isLoaded ? "#333" : "#999",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "14px",
                transition: "background-color 0.2s",
                ...(font.value === selectedFont && {
                  background: "#e6f7ff",
                  color: "#1890ff",
                }),
              }}
              onMouseEnter={e => {
                if (font.isLoaded) {
                  e.currentTarget.style.background = "#f5f5f5";
                }
              }}
              onMouseLeave={e => {
                if (font.value === selectedFont) {
                  e.currentTarget.style.background = "#e6f7ff";
                } else {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span>{font.displayName}</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {font.isLoading && (
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      border: "2px solid #f3f3f3",
                      borderTop: "2px solid #1890ff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                )}
                {!font.isLoading && !font.isLoaded && (
                  <span style={{ fontSize: "12px", color: "#ccc" }}>
                    未加载
                  </span>
                )}
                {!font.isLoading && font.isLoaded && (
                  <span style={{ fontSize: "12px", color: "#52c41a" }}>✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export const CalendarControls: React.FC<CalendarControlsProps> = ({
  year,
  setYear,
  startDay,
  setStartDay,
  // showMonthTitle,
  // setShowMonthTitle,
  // showOtherMonthDays,
  // setShowOtherMonthDays,
  selectedFont,
  setSelectedFont,
  isDownloading,
  onDownload,
  highlightSunday,
  setHighlightSunday,
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
      {/* <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
        <button
          onClick={() => setShowOtherMonthDays(!showOtherMonthDays)}
          style={{
            ...commonStyles.button,
            minWidth: "90px",
            borderRadius: "5px",
            padding: "4px 12px",
            fontSize: "15px",
            background: showOtherMonthDays ? "#e6f7ff" : "#f0f0f0",
            color: showOtherMonthDays ? "#1890ff" : "#606266",
            border: showOtherMonthDays
              ? "1px solid #91d5ff"
              : "1px solid #d9d9d9",
            transition: "all 0.2s",
          }}
        >
          {showOtherMonthDays ? "隐藏非该月" : "显示非该月"}
        </button>
      </div> */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <label
          htmlFor="font-select"
          style={{ fontSize: "15px", color: "#606266" }}
        >
          字体
        </label>
        <FontSelector
          selectedFont={selectedFont}
          onFontSelect={setSelectedFont}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={() => setHighlightSunday(!highlightSunday)}
          style={{
            ...commonStyles.button,
            minWidth: "120px",
            borderRadius: "5px",
            padding: "4px 12px",
            fontSize: "15px",
            background: highlightSunday ? "#fff1f0" : "#f0f0f0",
            color: highlightSunday ? "#D02F12" : "#606266",
            border: highlightSunday ? "1px solid #ffccc7" : "1px solid #d9d9d9",
            transition: "all 0.2s",
          }}
        >
          {highlightSunday ? "取消周日标红" : "周日标红"}
        </button>
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
