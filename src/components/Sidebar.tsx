import React from "react";
import { useWorks } from "../works/constants";
import { NavLink } from "react-router-dom";

const sidebarStyle: React.CSSProperties = {
  width: 180,
  background: "#fafafa",
  borderRight: "1px solid #eee",
  padding: "16px 0",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  fontSize: "smaller",
};
const linkStyle: React.CSSProperties = {
  padding: "8px 24px",
  textDecoration: "none",
  color: "#333",
  borderRadius: 4,
};
const activeStyle: React.CSSProperties = {
  background: "#e6f7ff",
  color: "#1890ff",
};

const Sidebar: React.FC = () => {
  const WORKS = useWorks();

  return (
    <nav style={sidebarStyle}>
      <NavLink
        to="/works"
        style={({ isActive }) => ({
          ...linkStyle,
          ...(isActive ? activeStyle : {}),
        })}
      >
        作品合集
      </NavLink>
      {WORKS.map(work => (
        <NavLink
          key={work.id}
          to={`/works/${work.id}`}
          style={({ isActive }) => ({
            ...linkStyle,
            ...(isActive ? activeStyle : {}),
          })}
        >
          {work.name}
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;
