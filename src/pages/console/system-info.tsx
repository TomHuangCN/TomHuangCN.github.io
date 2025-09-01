import React from "react";

export const SystemInfo: React.FC = () => {
  return (
    <div>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>系统信息</h2>
        <div style={styles.description}>
          <p>
            <strong>当前时间：</strong> {new Date().toLocaleString()}
          </p>
          <p>
            <strong>用户代理：</strong> {navigator.userAgent}
          </p>
          <p>
            <strong>语言：</strong> {navigator.language}
          </p>
          <p>
            <strong>在线状态：</strong> {navigator.onLine ? "在线" : "离线"}
          </p>
          <p>
            <strong>Cookie 启用：</strong>{" "}
            {navigator.cookieEnabled ? "是" : "否"}
          </p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>存储信息</h2>
        <div style={styles.description}>
          <p>
            <strong>本地存储：</strong> {localStorage ? "支持" : "不支持"}
          </p>
          <p>
            <strong>会话存储：</strong> {sessionStorage ? "支持" : "不支持"}
          </p>
          <p>
            <strong>IndexedDB：</strong> {window.indexedDB ? "支持" : "不支持"}
          </p>
          <p>
            <strong>Web Workers：</strong> {window.Worker ? "支持" : "不支持"}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  section: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#555",
  } as React.CSSProperties,

  description: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "15px",
    lineHeight: "1.5",
  } as React.CSSProperties,
};
