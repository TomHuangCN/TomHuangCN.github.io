import React from "react";
import { useNavigate } from "react-router-dom";
import { createContext, useState, useContext } from "react";
import { useWorks } from "../works/constants";
import StorageControls from "./storage-controls";

export interface SearchContextType {
  keyword: string;
  setKeyword: (k: string) => void;
}

export const SearchContext = createContext<SearchContextType>({
  keyword: "",
  setKeyword: () => {},
});

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: 56,
  padding: "0 24px",
  background: "#f5f5f5",
  borderBottom: "1px solid #eee",
};
const leftStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
};
const centerStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
};
const rightStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { keyword, setKeyword } = useContext(SearchContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const WORKS = useWorks();

  // 搜索匹配
  const filteredWorks = WORKS.filter(
    w =>
      keyword &&
      (w.name.toLowerCase().includes(keyword.toLowerCase()) ||
        w.desc.toLowerCase().includes(keyword.toLowerCase()))
  );

  // 处理点击跳转
  const handleSelect = (id: string) => {
    setShowDropdown(false);
    setKeyword("");
    navigate(`/works/${id}`);
  };

  return (
    <header style={headerStyle}>
      <div style={leftStyle} onClick={() => navigate("/")}>
        <span>
          <span style={{ color: "#e57373" }}>Y</span>ou{" "}
          <span style={{ color: "#64b5f6" }}>H</span>ave{" "}
          <span style={{ color: "#81c784" }}>A</span>{" "}
          <span style={{ color: "#ffd54f" }}>G</span>ood{" "}
          <span style={{ color: "#ba68c8" }}>E</span>ye
        </span>
      </div>
      <div style={centerStyle}>
        <div style={{ position: "relative", width: 240 }}>
          <input
            type="text"
            placeholder="搜索占位"
            value={keyword}
            onChange={e => {
              setKeyword(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => keyword && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            style={{
              width: "100%",
              padding: 6,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
          {showDropdown && filteredWorks.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: 36,
                left: 0,
                width: "100%",
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 4,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                zIndex: 10,
                margin: 0,
                padding: 0,
                listStyle: "none",
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {filteredWorks.map(w => (
                <li
                  key={w.id}
                  onMouseDown={() => handleSelect(w.id)}
                  style={{ padding: "8px 12px", cursor: "pointer" }}
                >
                  <div style={{ fontWeight: 500 }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{w.desc}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div style={rightStyle}>
        <StorageControls />
        <button onClick={() => navigate("/cooperation")}>业务合作</button>
      </div>
    </header>
  );
};

export default Header;
