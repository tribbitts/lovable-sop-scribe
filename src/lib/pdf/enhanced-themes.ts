
export interface PdfTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
    border: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    accent: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  borderRadius: number;
}

export const pdfThemes: Record<string, PdfTheme> = {
  professional: {
    name: "Professional",
    colors: {
      primary: "#007AFF", // SOPify blue
      secondary: "#1E1E1E", 
      accent: "#007AFF", // Changed from green to blue for consistency
      background: "#FFFFFF", // Pure white
      text: "#2D2D2D",
      textLight: "#6B7280",
      border: "#E5E5E5"
    },
    fonts: {
      primary: "helvetica", // Use safe font
      secondary: "helvetica", 
      accent: "helvetica"
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
      xlarge: 32
    },
    borderRadius: 8
  },
  elegant: {
    name: "Elegant",
    colors: {
      primary: "#007AFF", // Changed to SOPify blue
      secondary: "#374151",
      accent: "#007AFF", // Changed to blue
      background: "#FFFFFF",
      text: "#1F2937",
      textLight: "#9CA3AF",
      border: "#F3F4F6"
    },
    fonts: {
      primary: "helvetica",
      secondary: "helvetica",
      accent: "helvetica"
    },
    spacing: {
      small: 10,
      medium: 20,
      large: 30,
      xlarge: 40
    },
    borderRadius: 12
  },
  technical: {
    name: "Technical",
    colors: {
      primary: "#007AFF", // Changed to SOPify blue
      secondary: "#0F172A",
      accent: "#007AFF", // Changed to blue
      background: "#F8F9FA", // Light gray instead of blue
      text: "#334155",
      textLight: "#64748B",
      border: "#CBD5E1"
    },
    fonts: {
      primary: "helvetica",
      secondary: "helvetica",
      accent: "helvetica"
    },
    spacing: {
      small: 6,
      medium: 14,
      large: 22,
      xlarge: 28
    },
    borderRadius: 6
  },
  modern: {
    name: "Modern",
    colors: {
      primary: "#007AFF", // Changed to SOPify blue
      secondary: "#0F172A",
      accent: "#007AFF", // Changed to blue
      background: "#F8FAFC",
      text: "#1E293B",
      textLight: "#64748B",
      border: "#CBD5E1"
    },
    fonts: {
      primary: "helvetica",
      secondary: "helvetica",
      accent: "helvetica"
    },
    spacing: {
      small: 10,
      medium: 18,
      large: 28,
      xlarge: 36
    },
    borderRadius: 12
  },
  corporate: {
    name: "Corporate",
    colors: {
      primary: "#1F2937",
      secondary: "#374151",
      accent: "#007AFF", // Changed from red to blue
      background: "#FFFFFF", 
      text: "#111827",
      textLight: "#6B7280",
      border: "#D1D5DB"
    },
    fonts: {
      primary: "helvetica",
      secondary: "helvetica",
      accent: "helvetica"
    },
    spacing: {
      small: 6,
      medium: 14,
      large: 22,
      xlarge: 30
    },
    borderRadius: 6
  }
};

export function getCustomTheme(customColors?: { primary?: string; secondary?: string }): PdfTheme {
  const baseTheme = pdfThemes.professional;
  
  if (!customColors) return baseTheme;
  
  return {
    ...baseTheme,
    name: "Custom",
    colors: {
      ...baseTheme.colors,
      primary: customColors.primary || baseTheme.colors.primary,
      secondary: customColors.secondary || baseTheme.colors.secondary
    }
  };
}
