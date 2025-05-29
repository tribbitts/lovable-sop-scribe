export interface ExportTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  styles: {
    headerGradient?: string;
    borderRadius: string;
    shadowStyle: string;
    buttonStyle: string;
  };
}

export const exportThemes: ExportTheme[] = [
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    description: "Professional blue theme ideal for business documentation",
    colors: {
      primary: "#1e40af",
      secondary: "#3730a3",
      accent: "#0ea5e9",
      text: "#1e293b",
      background: "#f8fafc",
      border: "#e2e8f0"
    },
    fonts: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      monospace: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace"
    },
    styles: {
      headerGradient: "linear-gradient(135deg, #1e40af 0%, #3730a3 100%)",
      borderRadius: "8px",
      shadowStyle: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      buttonStyle: "professional"
    }
  },
  {
    id: "executive-dark",
    name: "Executive Dark",
    description: "Sophisticated dark theme for premium documentation",
    colors: {
      primary: "#f59e0b",
      secondary: "#d97706",
      accent: "#fbbf24",
      text: "#f9fafb",
      background: "#111827",
      border: "#374151"
    },
    fonts: {
      primary: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      secondary: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      monospace: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace"
    },
    styles: {
      headerGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      borderRadius: "12px",
      shadowStyle: "0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)",
      buttonStyle: "elegant"
    }
  },
  {
    id: "modern-teal",
    name: "Modern Teal",
    description: "Fresh, modern design with teal accents",
    colors: {
      primary: "#0d9488",
      secondary: "#0f766e",
      accent: "#14b8a6",
      text: "#134e4a",
      background: "#f0fdfa",
      border: "#99f6e4"
    },
    fonts: {
      primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      monospace: "'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace"
    },
    styles: {
      headerGradient: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
      borderRadius: "16px",
      shadowStyle: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      buttonStyle: "modern"
    }
  },
  {
    id: "classic-serif",
    name: "Classic Serif",
    description: "Traditional, elegant design with serif fonts",
    colors: {
      primary: "#7c2d12",
      secondary: "#92400e",
      accent: "#b91c1c",
      text: "#292524",
      background: "#fef3c7",
      border: "#d6d3d1"
    },
    fonts: {
      primary: "'Merriweather', Georgia, 'Times New Roman', serif",
      secondary: "'Lora', Georgia, 'Times New Roman', serif",
      monospace: "'IBM Plex Mono', 'Courier New', Courier, monospace"
    },
    styles: {
      headerGradient: "linear-gradient(135deg, #7c2d12 0%, #92400e 100%)",
      borderRadius: "4px",
      shadowStyle: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      buttonStyle: "classic"
    }
  },
  {
    id: "tech-purple",
    name: "Tech Purple",
    description: "Modern tech-focused theme with purple gradients",
    colors: {
      primary: "#7c3aed",
      secondary: "#6d28d9",
      accent: "#a78bfa",
      text: "#1f2937",
      background: "#faf5ff",
      border: "#e9d5ff"
    },
    fonts: {
      primary: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      monospace: "'Fira Code', 'SF Mono', Monaco, Consolas, monospace"
    },
    styles: {
      headerGradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      borderRadius: "12px",
      shadowStyle: "0 10px 15px -3px rgb(124 58 237 / 0.1), 0 4px 6px -4px rgb(124 58 237 / 0.1)",
      buttonStyle: "futuristic"
    }
  },
  {
    id: "healthcare-green",
    name: "Healthcare Green",
    description: "Clean, medical-grade design for healthcare SOPs",
    colors: {
      primary: "#059669",
      secondary: "#047857",
      accent: "#10b981",
      text: "#064e3b",
      background: "#ecfdf5",
      border: "#a7f3d0"
    },
    fonts: {
      primary: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
      secondary: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
      monospace: "'Roboto Mono', 'SF Mono', Monaco, Consolas, monospace"
    },
    styles: {
      headerGradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      borderRadius: "6px",
      shadowStyle: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      buttonStyle: "clinical"
    }
  },
  {
    id: "industrial-gray",
    name: "Industrial Gray",
    description: "Strong, industrial design for manufacturing and operations",
    colors: {
      primary: "#374151",
      secondary: "#1f2937",
      accent: "#6b7280",
      text: "#111827",
      background: "#f9fafb",
      border: "#d1d5db"
    },
    fonts: {
      primary: "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      monospace: "'Source Code Pro', 'SF Mono', Monaco, Consolas, monospace"
    },
    styles: {
      headerGradient: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
      borderRadius: "4px",
      shadowStyle: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      buttonStyle: "industrial"
    }
  },
  {
    id: "finance-navy",
    name: "Finance Navy",
    description: "Trustworthy navy theme for financial and legal documentation",
    colors: {
      primary: "#1e3a8a",
      secondary: "#1e40af",
      accent: "#3b82f6",
      text: "#0f172a",
      background: "#f0f9ff",
      border: "#bfdbfe"
    },
    fonts: {
      primary: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      monospace: "'IBM Plex Mono', 'SF Mono', Monaco, Consolas, monospace"
    },
    styles: {
      headerGradient: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
      borderRadius: "8px",
      shadowStyle: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      buttonStyle: "corporate"
    }
  }
];

// Font options for the dropdown
export const fontOptions = [
  { 
    id: "helvetica", 
    name: "Helvetica (Recommended)", 
    value: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    description: "Clean, professional sans-serif"
  },
  { 
    id: "inter", 
    name: "Inter", 
    value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    description: "Modern, highly readable"
  },
  { 
    id: "roboto", 
    name: "Roboto", 
    value: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    description: "Google's clean design font"
  },
  { 
    id: "poppins", 
    name: "Poppins", 
    value: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    description: "Friendly, rounded sans-serif"
  },
  { 
    id: "work-sans", 
    name: "Work Sans", 
    value: "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    description: "Optimized for screen reading"
  },
  { 
    id: "space-grotesk", 
    name: "Space Grotesk", 
    value: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    description: "Modern, technical feel"
  },
  { 
    id: "ibm-plex", 
    name: "IBM Plex Sans", 
    value: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    description: "Corporate, accessible design"
  },
  { 
    id: "merriweather", 
    name: "Merriweather", 
    value: "'Merriweather', Georgia, 'Times New Roman', serif",
    description: "Traditional serif for formal docs"
  },
  { 
    id: "lora", 
    name: "Lora", 
    value: "'Lora', Georgia, 'Times New Roman', serif",
    description: "Elegant serif with character"
  },
  { 
    id: "georgia", 
    name: "Georgia", 
    value: "Georgia, 'Times New Roman', Times, serif",
    description: "Classic serif typeface"
  }
];

// Helper function to apply theme to HTML template
export function applyThemeToTemplate(html: string, theme: ExportTheme, selectedFont?: string): string {
  // Replace color variables
  html = html.replace(/--primary-color: [^;]+;/g, `--primary-color: ${theme.colors.primary};`);
  html = html.replace(/--secondary-color: [^;]+;/g, `--secondary-color: ${theme.colors.secondary};`);
  html = html.replace(/--accent-color: [^;]+;/g, `--accent-color: ${theme.colors.accent};`);
  html = html.replace(/--text-color: [^;]+;/g, `--text-color: ${theme.colors.text};`);
  html = html.replace(/--background-color: [^;]+;/g, `--background-color: ${theme.colors.background};`);
  html = html.replace(/--border-color: [^;]+;/g, `--border-color: ${theme.colors.border};`);
  
  // Replace gradient if present
  if (theme.styles.headerGradient) {
    html = html.replace(/background:\s*linear-gradient\([^)]+\)/g, `background: ${theme.styles.headerGradient}`);
  }
  
  // Replace fonts
  const fontFamily = selectedFont || theme.fonts.primary;
  html = html.replace(/font-family:\s*'Helvetica[^;]+;/g, `font-family: ${fontFamily};`);
  html = html.replace(/--font-primary:[^;]+;/g, `--font-primary: ${fontFamily};`);
  html = html.replace(/--font-secondary:[^;]+;/g, `--font-secondary: ${theme.fonts.secondary};`);
  html = html.replace(/--font-monospace:[^;]+;/g, `--font-monospace: ${theme.fonts.monospace};`);
  
  // Replace border radius
  html = html.replace(/--border-radius:[^;]+;/g, `--border-radius: ${theme.styles.borderRadius};`);
  
  // Replace shadow styles
  html = html.replace(/--shadow-style:[^;]+;/g, `--shadow-style: ${theme.styles.shadowStyle};`);
  
  return html;
} 