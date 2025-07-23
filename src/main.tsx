import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import WorksList from './pages/WorksList';
import WorkDetail from './pages/WorkDetail';
import Cooperation from './pages/Cooperation';

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

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
); 