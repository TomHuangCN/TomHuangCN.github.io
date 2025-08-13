import React, { useState, useEffect } from "react";
import { fontStatusManager } from "./font-status-manager";
import { fontOptions } from "./constants";

export const FontStatusTest: React.FC = () => {
  const [fonts, setFonts] = useState(fontOptions);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = fontStatusManager.subscribe(setFonts);
    return unsubscribe;
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const refreshStatus = () => {
    fontStatusManager.refreshStatus();
  };

  if (!isVisible) {
    return (
      <div style={{ margin: "20px 0" }}>
        <button
          onClick={toggleVisibility}
          style={{
            padding: "8px 16px",
            background: "#1890ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          显示字体状态测试
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: "20px 0",
        padding: "20px",
        border: "1px solid #d9d9d9",
        borderRadius: "8px",
        background: "#fafafa",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0 }}>字体加载状态测试</h3>
        <div>
          <button
            onClick={refreshStatus}
            style={{
              padding: "6px 12px",
              background: "#52c41a",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "8px",
            }}
          >
            刷新状态
          </button>
          <button
            onClick={toggleVisibility}
            style={{
              padding: "6px 12px",
              background: "#ff4d4f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            隐藏
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        {fonts.map(font => (
          <div
            key={font.name}
            style={{
              padding: "16px",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              background: "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h4 style={{ margin: 0, fontSize: "16px" }}>{font.displayName}</h4>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {font.isLoading && (
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #f3f3f3",
                      borderTop: "2px solid #1890ff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                )}
                {!font.isLoading && !font.isLoaded && (
                  <span style={{ fontSize: "12px", color: "#ff4d4f", fontWeight: "bold" }}>未加载</span>
                )}
                {!font.isLoading && font.isLoaded && (
                  <span style={{ fontSize: "12px", color: "#52c41a", fontWeight: "bold" }}>✓ 已加载</span>
                )}
              </div>
            </div>
            
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
              字体名称: {font.name}
            </div>
            
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
              字体值: {font.value}
            </div>

            <div style={{ fontSize: "12px", color: "#666" }}>
              状态: {font.isLoading ? "加载中..." : font.isLoaded ? "可用" : "不可用"}
            </div>
          </div>
        ))}
      </div>

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
