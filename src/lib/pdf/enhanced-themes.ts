
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
      primary: "#007AFF",
      secondary: "#1E1E1E", 
      accent: "#4CAF50",
      background: "#FAFAFA",
      text: "#2D2D2D",
      textLight: "#6B7280",
      border: "#E5E5E5"
    },
    fonts: {
      primary: "Inter",
      secondary: "Inter", 
      accent: "Inter"
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
      xlarge: 32
    },
    borderRadius: 8
  },
  modern: {
    name: "Modern",
    colors: {
      primary: "#6366F1",
      secondary: "#0F172A",
      accent: "#10B981", 
      background: "#F8FAFC",
      text: "#1E293B",
      textLight: "#64748B",
      border: "#CBD5E1"
    },
    fonts: {
      primary: "Inter",
      secondary: "Inter",
      accent: "Inter"
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
      accent: "#DC2626",
      background: "#FFFFFF", 
      text: "#111827",
      textLight: "#6B7280",
      border: "#D1D5DB"
    },
    fonts: {
      primary: "Inter",
      secondary: "Inter",
      accent: "Inter"
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
