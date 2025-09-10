import React from "react";
import { Outlet } from "react-router-dom";
import Header, { SearchContext } from "./components/Header";
import Sidebar from "./components/sidebar";
import { useState } from "react";
import "./styles/responsive.css";

const styles = {
  app: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
  },
  main: {
    display: "flex",
    flex: 1,
    minHeight: 0,
  },
  content: {
    flex: 1,
    padding: 24,
    overflow: "auto" as const,
  },
} as const;

const App: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  return (
    <SearchContext.Provider value={{ keyword, setKeyword }}>
      <div style={styles.app}>
        <Header />
        <div style={styles.main}>
          <Sidebar />
          <div style={styles.content} className="main-content">
            <Outlet />
          </div>
        </div>
      </div>
    </SearchContext.Provider>
  );
};

export default App;
