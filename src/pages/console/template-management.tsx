import React from "react";
import { TemplateStorage } from "../../helpers/calendar-demo/template-storage";
import type { TemplateConfig } from "../../helpers/calendar-demo/types";

interface TemplateManagementProps {
  templateConfig: TemplateConfig;
  setTemplateConfig: (config: TemplateConfig) => void;
}

export const TemplateManagement: React.FC<TemplateManagementProps> = ({
  templateConfig,
  setTemplateConfig,
}) => {
  // 切换模板功能
  const handleToggleTemplate = async () => {
    try {
      const templateStorage = new TemplateStorage();
      const newEnabled = !templateConfig.enabled;
      const newConfig = { ...templateConfig, enabled: newEnabled };

      await templateStorage.saveConfig(newConfig);
      setTemplateConfig(newConfig);

      console.log(`模板功能已${newEnabled ? "开启" : "关闭"}`);
      alert(`模板功能已${newEnabled ? "开启" : "关闭"}`);
    } catch (error) {
      console.error("切换模板功能失败:", error);
      alert("切换模板功能失败，请重试");
    }
  };

  return (
    <div>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>模板功能开关</h2>
        <p style={styles.description}>
          控制日历模板功能的开启和关闭。开启后可以使用模板功能创建和编辑日历模板。
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={handleToggleTemplate}
            style={{
              ...styles.button,
              background: templateConfig.enabled ? "#f44336" : "#4CAF50",
              color: "white",
            }}
          >
            {templateConfig.enabled ? "关闭模板功能" : "开启模板功能"}
          </button>
          <span
            style={{
              padding: "8px 16px",
              backgroundColor: templateConfig.enabled ? "#e8f5e8" : "#ffebee",
              color: templateConfig.enabled ? "#2e7d32" : "#c62828",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            当前状态: {templateConfig.enabled ? "已开启" : "已关闭"}
          </span>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>使用说明</h2>
        <div style={styles.description}>
          <h4>模板功能说明：</h4>
          <ul style={{ marginLeft: "20px", marginTop: "8px" }}>
            <li>开启模板功能后，在日历制作页面会显示模板选择器</li>
            <li>可以创建新模板，设置每页的模板图片和用户图片位置</li>
            <li>使用模板时，用户图片会根据模板设置自动合成</li>
            <li>模板数据保存在本地 IndexedDB 中</li>
          </ul>

          <h4 style={{ marginTop: "16px" }}>快捷键：</h4>
          <ul style={{ marginLeft: "20px", marginTop: "8px" }}>
            <li>
              <strong>Ctrl + Shift + T</strong>: 快速切换模板功能（在日历页面）
            </li>
          </ul>
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

  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginRight: "10px",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
};
