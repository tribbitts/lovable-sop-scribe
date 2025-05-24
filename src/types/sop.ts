
export type CalloutShape = "circle" | "rectangle" | "arrow" | "number";

export interface Callout {
  id: string;
  shape: CalloutShape;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  number?: number; // For numbered callouts
  text?: string; // For text callouts
}

export interface ScreenshotData {
  id: string;
  dataUrl: string;
  originalDataUrl?: string; // Store original before cropping
  callouts: Callout[];
  secondaryDataUrl?: string;
  secondaryCallouts?: Callout[];
  isCropped?: boolean;
}

export interface StepResource {
  id: string;
  type: "link" | "file";
  title: string;
  url: string;
  description?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface LearningObjective {
  id: string;
  text: string;
  category?: "knowledge" | "skill" | "behavior";
}

export interface SopStep {
  id: string;
  title?: string;
  description: string;
  detailedInstructions?: string;
  notes?: string;
  tags?: string[];
  resources?: StepResource[];
  screenshot: ScreenshotData | null;
  completed?: boolean;
  fileLink?: string; // Adding this property to fix the error
  fileLinkText?: string; // Adding this property to fix the error
  
  // Training module properties
  trainingMode?: boolean;
  learningObjectives?: LearningObjective[];
  quizQuestions?: QuizQuestion[];
  requiredScore?: number; // Percentage needed to pass
  allowRetakes?: boolean;
}

export interface SopDocument {
  title: string;
  topic: string;
  date: string;
  logo: string | null;
  backgroundImage?: string | null;
  steps: SopStep[];
  companyName: string;
  tableOfContents?: boolean;
  darkMode?: boolean;
  trainingMode?: boolean;
  progressTracking?: {
    enabled: boolean;
    sessionName?: string;
    lastSaved?: string;
  };
}

export interface AppSettings {
  companyName: string;
  defaultDarkMode?: boolean;
  autoSave?: boolean;
}

// Export options
export type ExportFormat = "pdf" | "html" | "training-module";
export type ExportTheme = "light" | "dark" | "auto";

// Export options - now includes mode for HTML exports and enhanced training module options
export interface ExportOptions {
  theme?: ExportTheme;
  includeTableOfContents?: boolean;
  includeProgressInfo?: boolean;
  customFooter?: string;
  quality?: "low" | "medium" | "high";
  mode?: 'standalone' | 'zip'; // Added to make compatible with HtmlExportOptions
  // Enhanced/Training module options
  enhanced?: boolean;
  enhancedOptions?: any;
  trainingOptions?: {
    enableQuizzes?: boolean;
    enableCertificates?: boolean;
    enableNotes?: boolean;
    enableBookmarks?: boolean;
    passwordProtection?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

// Progress tracking
export interface ProgressSession {
  id: string;
  name: string;
  completedSteps: string[];
  totalSteps: number;
  lastUpdated: string;
  sopTitle: string;
}

// Subscription tiers
export type SubscriptionTier = "free" | "pro-pdf" | "pro-html" | "pro-complete";

// Cropping types
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Component props for modular architecture
export interface StepCardProps {
  step: SopStep;
  index: number;
  isActive?: boolean;
  onStepChange?: (stepId: string, field: keyof SopStep, value: any) => void;
  onStepComplete?: (stepId: string, completed: boolean) => void;
}

export interface CalloutOverlayProps {
  screenshot: ScreenshotData;
  isEditing: boolean;
  onCalloutAdd?: (callout: Omit<Callout, "id">) => void;
  onCalloutUpdate?: (callout: Callout) => void;
  onCalloutDelete?: (calloutId: string) => void;
}

export interface ImageCropperProps {
  imageDataUrl: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export interface ProgressTrackerProps {
  completed: number;
  total: number;
  showPercentage?: boolean;
  variant?: "bar" | "ring" | "steps";
  className?: string;
}

export interface ExportPanelProps {
  document: SopDocument;
  onExport: (format: ExportFormat, options?: ExportOptions) => void;
  isExporting?: boolean;
  exportProgress?: string;
}
