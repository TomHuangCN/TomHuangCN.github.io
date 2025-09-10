import React from "react";
import { useNavigate } from "react-router-dom";
import { createContext, useState, useContext } from "react";
import { useWorks } from "../works/constants";
import MobileSidebar from "./mobile-sidebar";

export interface SearchContextType {
  keyword: string;
  setKeyword: (k: string) => void;
}

export const SearchContext = createContext<SearchContextType>({
  keyword: "",
  setKeyword: () => {},
});

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    padding: "0 24px",
    background: "#f5f5f5",
    borderBottom: "1px solid #eee",
  },
  left: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  center: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  right: {
    display: "flex",
    alignItems: "center",
  },
  searchContainer: {
    position: "relative" as const,
    width: 240,
  },
  searchInput: {
    width: "100%",
    padding: 6,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  dropdown: {
    position: "absolute" as const,
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
    listStyle: "none" as const,
    maxHeight: 220,
    overflowY: "auto" as const,
  },
  dropdownItem: {
    padding: "8px 12px",
    cursor: "pointer",
  },
  itemName: {
    fontWeight: 500,
  },
  itemDesc: {
    fontSize: 12,
    color: "#888",
  },
  button: {
    padding: "6px 12px",
    margin: "0 8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "12px",
  },
  rightButton: {
    padding: "6px 12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "12px",
  },
  hamburgerMenu: {
    display: "none",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "8px",
    color: "#333",
    marginRight: "16px",
  },
  mobileSearchContainer: {
    position: "relative" as const,
    width: "100%",
    maxWidth: 280,
  },
} as const;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { keyword, setKeyword } = useContext(SearchContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const WORKS = useWorks();

  const filteredWorks = keyword
    ? WORKS.filter(
        work =>
          work.name.toLowerCase().includes(keyword.toLowerCase()) ||
          work.desc.toLowerCase().includes(keyword.toLowerCase())
      )
    : [];

  const handleSelect = (id: string) => {
    setShowDropdown(false);
    setKeyword("");
    navigate(`/works/${id}`);
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.left}>
          <button
            style={styles.hamburgerMenu}
            onClick={() => setIsMobileSidebarOpen(true)}
            className="hamburger-menu"
          >
            ☰
          </button>
          <div onClick={() => navigate("/")} className="header-title">
            <span>
              <span style={{ color: "#e57373" }}>Y</span>ou{" "}
              <span style={{ color: "#64b5f6" }}>H</span>ave{" "}
              <span style={{ color: "#81c784" }}>A</span>{" "}
              <span style={{ color: "#ffd54f" }}>G</span>ood{" "}
              <span style={{ color: "#ba68c8" }}>E</span>ye
            </span>
          </div>
        </div>

        <div style={styles.center}>
          <div
            style={styles.searchContainer}
            className="search-container-mobile"
          >
            <input
              type="text"
              placeholder="搜索作品..."
              value={keyword}
              onChange={e => {
                setKeyword(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => keyword && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              style={styles.searchInput}
              className="search-input-mobile"
            />
            {showDropdown && filteredWorks.length > 0 && (
              <ul style={styles.dropdown}>
                {filteredWorks.map(work => (
                  <li
                    key={work.id}
                    onMouseDown={() => handleSelect(work.id)}
                    style={styles.dropdownItem}
                  >
                    <div style={styles.itemName}>{work.name}</div>
                    <div style={styles.itemDesc}>{work.desc}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div style={styles.right} className="desktop-buttons">
          <button onClick={() => navigate("/console")} style={styles.button}>
            控制台
          </button>
          <button
            onClick={() => navigate("/cooperation")}
            style={styles.rightButton}
          >
            业务合作
          </button>
        </div>
      </header>

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
    </>
  );
};

export default Header;
