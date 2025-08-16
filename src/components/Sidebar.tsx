import React from "react";
import { useWorks } from "../works/constants";
import { NavLink } from "react-router-dom";

const styles = {
  sidebar: {
    width: 180,
    background: "#fafafa",
    borderRight: "1px solid #eee",
    padding: "16px 0",
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
    fontSize: "smaller",
  },
  link: {
    padding: "8px 24px",
    textDecoration: "none" as const,
    color: "#333",
    borderRadius: 4,
  },
  active: {
    background: "#e6f7ff",
    color: "#1890ff",
  },
} as const;

const Sidebar: React.FC = () => {
  const WORKS = useWorks();

  return (
    <nav style={styles.sidebar}>
      <NavLink
        to="/works"
        style={({ isActive }) => ({
          ...styles.link,
          ...(isActive ? styles.active : {}),
        })}
      >
        作品合集
      </NavLink>
      {WORKS.map(work => (
        <NavLink
          key={work.id}
          to={`/works/${work.id}`}
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.active : {}),
          })}
        >
          {work.name}
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;
