import React from "react";

export interface TooltipProps {
  content: string;
  link?: string;
  children?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, link, children }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (link) {
      e.preventDefault();
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
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
          : "1px solid rgba(153, 153, 153, 0.3)",
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
  );
};

export default Tooltip;
