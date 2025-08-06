import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./app";
import WorksList from "./pages/works-list";
import WorkDetail from "./pages/work-detail";
import Cooperation from "./pages/cooperation";
import DataManagement from "./pages/data-management";
import { autoPreloadFonts } from "./utils/font-loader";

const Main: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="/works" replace />} />
        <Route path="works" element={<WorksList />} />
        <Route path="works/:id" element={<WorkDetail />} />
        <Route path="cooperation" element={<Cooperation />} />
        <Route path="data-management" element={<DataManagement />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

// 自动预加载字体
autoPreloadFonts();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
