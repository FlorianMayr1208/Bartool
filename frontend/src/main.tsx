import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ViewportProvider } from './contexts/ViewportContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ViewportProvider>
      <App />
    </ViewportProvider>
  </StrictMode>,
);
