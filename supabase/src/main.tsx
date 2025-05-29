import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { DocumentProvider } from './context/DocumentContext'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <DocumentProvider>
      <App />
    </DocumentProvider>
  </ThemeProvider>
);
