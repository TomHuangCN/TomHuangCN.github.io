import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./app";
import WorksList from "./pages/works-list";
import WorkDetail from "./pages/work-detail";
import Cooperation from "./pages/Cooperation";
import Console from "./pages/console";
import { autoPreloadFonts } from "./utils/font-loader";

const routes = [
  { path: "/", element: <Navigate to="/works" replace /> },
  { path: "/works", element: <WorksList /> },
  { path: "/works/:id", element: <WorkDetail /> },
  { path: "/cooperation", element: <Cooperation /> },
  { path: "/console", element: <Console /> },
];

const Main: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
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
