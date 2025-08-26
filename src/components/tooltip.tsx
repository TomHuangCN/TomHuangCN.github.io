import React, { useState } from "react";

export interface TooltipProps {
  content: string;
  link?: string;
  children?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, link, children }) => {
  const [showMobileTooltip, setShowMobileTooltip] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (link) {
      e.preventDefault();
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      // 在移动端显示工具提示
      setShowMobileTooltip(!showMobileTooltip);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          cursor: link ? "pointer" : "help",
          color: link ? "#1890ff" : "#999",
          fontSize: "14px",
          fontWeight: "normal",
          userSelect: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: link
            ? "rgba(24, 144, 255, 0.1)"
            : "rgba(153, 153, 153, 0.1)",
          border: link
            ? "1px solid rgba(24, 144, 255, 0.3)"
            : "rgba(153, 153, 153, 0.3)",
          lineHeight: "1",
          transition: "all 0.2s ease",
        }}
        onClick={handleClick}
        title={content}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = link
            ? "rgba(24, 144, 255, 0.2)"
            : "rgba(153, 153, 153, 0.2)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = link
            ? "rgba(24, 144, 255, 0.1)"
            : "rgba(153, 153, 153, 0.1)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {children || "?"}
      </span>

      {/* 移动端工具提示 */}
      {showMobileTooltip && !link && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#333",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            zIndex: 1000,
            marginBottom: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {content}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              border: "4px solid transparent",
              borderTopColor: "#333",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
