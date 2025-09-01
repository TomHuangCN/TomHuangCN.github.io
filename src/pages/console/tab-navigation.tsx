import React from "react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Array<{
    id: string;
    name: string;
  }>;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  tabs,
}) => {
  return (
    <div style={styles.tabContainer}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={activeTab === tab.id ? styles.activeTab : styles.tab}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};

const styles = {
  tabContainer: {
    display: "flex",
    borderBottom: "2px solid #e0e0e0",
    marginBottom: "30px",
  } as React.CSSProperties,

  tab: {
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    color: "#666",
    borderBottom: "3px solid transparent",
    transition: "all 0.3s ease",
    border: "none",
    background: "transparent",
  } as React.CSSProperties,

  activeTab: {
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    color: "#007bff",
    borderBottom: "3px solid #007bff",
    transition: "all 0.3s ease",
    border: "none",
    background: "transparent",
  } as React.CSSProperties,
};
