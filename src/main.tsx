import "./i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./app";
import WorksList from "./pages/works-list";
import WorkDetail from "./pages/work-detail";
import Cooperation from "./pages/cooperation";

const Main: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="/works" replace />} />
        <Route path="works" element={<WorksList />} />
        <Route path="works/:id" element={<WorkDetail />} />
        <Route path="cooperation" element={<Cooperation />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
