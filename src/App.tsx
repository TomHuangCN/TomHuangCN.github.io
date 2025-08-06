import React from "react";
import { Outlet } from "react-router-dom";
import Header, { SearchContext } from "./components/Header";
import Sidebar from "./components/sidebar";
import { useState } from "react";

const appStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
};
const mainStyle: React.CSSProperties = {
  display: "flex",
  flex: 1,
  minHeight: 0,
};

const App: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  return (
    <SearchContext.Provider value={{ keyword, setKeyword }}>
      <div style={appStyle}>
        <Header />
        <div style={mainStyle}>
          <Sidebar />
          <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
            <Outlet />
          </div>
        </div>
      </div>
    </SearchContext.Provider>
  );
};

export default App;
