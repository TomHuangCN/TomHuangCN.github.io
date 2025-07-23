import React from 'react';
import ReactDOM from 'react-dom/client';

const App: React.FC = () => <h1>Hello, React + TypeScript!</h1>;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 