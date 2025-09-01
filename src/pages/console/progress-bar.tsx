import React from "react";

interface ProgressBarProps {
  isVisible: boolean;
  progress: number;
  message: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  isVisible,
  progress,
  message,
}) => {
  if (!isVisible) return null;

  return (
    <>
      <div style={styles.overlay} />
      <div style={styles.progressBar}>
        <div style={styles.message}>{message}</div>
        <div style={styles.progressContainer}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          />
        </div>
        <div style={styles.progressText}>{progress}%</div>
      </div>
    </>
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  } as React.CSSProperties,

  progressBar: {
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 1000,
    minWidth: "300px",
  } as React.CSSProperties,

  message: {
    textAlign: "center" as const,
    marginBottom: "10px",
  } as React.CSSProperties,

  progressContainer: {
    width: "100%",
    height: "20px",
    backgroundColor: "#f0f0f0",
    borderRadius: "10px",
    overflow: "hidden",
    margin: "10px 0",
  } as React.CSSProperties,

  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    transition: "width 0.3s ease",
  } as React.CSSProperties,

  progressText: {
    textAlign: "center" as const,
    fontSize: "12px",
    color: "#666",
  } as React.CSSProperties,
};
