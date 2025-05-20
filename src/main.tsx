
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { SopProvider } from './context/SopContext'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <SopProvider>
      <App />
    </SopProvider>
  </ThemeProvider>
);
