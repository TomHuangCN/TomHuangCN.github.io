import React from "react";
import { useWorks } from "../works/constants";
import { NavLink } from "react-router-dom";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "flex-start",
  },
  sidebar: {
    width: "280px",
    height: "100%",
    background: "#fff",
    boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
    overflowY: "auto" as const,
    transform: "translateX(0)",
    transition: "transform 0.3s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid #eee",
    background: "#fafafa",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    color: "#333",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    padding: "4px",
    color: "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "4px",
  },
  nav: {
    padding: "16px 0",
  },
  link: {
    display: "block",
    padding: "16px 24px",
    textDecoration: "none" as const,
    color: "#333",
    fontSize: "16px",
    borderBottom: "1px solid #f0f0f0",
    transition: "background-color 0.2s ease",
  },
  active: {
    background: "#e6f7ff",
    color: "#1890ff",
    borderLeft: "4px solid #1890ff",
  },
  workItem: {
    padding: "12px 24px",
    borderBottom: "1px solid #f0f0f0",
  },
  workLink: {
    display: "block",
    textDecoration: "none" as const,
    color: "#333",
    fontSize: "14px",
    padding: "8px 0",
  },
  workName: {
    fontWeight: 500,
    marginBottom: "4px",
  },
  workDesc: {
    fontSize: "12px",
    color: "#888",
    lineHeight: "1.4",
  },
} as const;

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const WORKS = useWorks();

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sidebar} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>导航菜单</h3>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <nav style={styles.nav}>
          <NavLink
            to="/works"
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.active : {}),
            })}
            onClick={onClose}
          >
            作品合集
          </NavLink>

          {WORKS.map(work => (
            <div key={work.id} style={styles.workItem}>
              <NavLink
                to={`/works/${work.id}`}
                style={({ isActive }) => ({
                  ...styles.workLink,
                  ...(isActive ? styles.active : {}),
                })}
                onClick={onClose}
              >
                <div style={styles.workName}>{work.name}</div>
                <div style={styles.workDesc}>{work.desc}</div>
              </NavLink>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;
