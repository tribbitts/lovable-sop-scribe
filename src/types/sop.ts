
// Training Module Creator - Enhanced Types
// Sync test: Updated for Lovable platform integration
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
  revealText?: string; // For click-to-reveal functionality on numbered callouts
}

export interface ScreenshotData {
  id: string;
  dataUrl: string;
  originalDataUrl?: string; // Store original before cropping
  callouts: Callout[];
  isCropped?: boolean;
  title?: string; // Optional title for the screenshot
  description?: string; // Optional description
  // Legacy secondary screenshot properties for backward compatibility
  secondaryDataUrl?: string;
  secondaryCallouts?: Callout[];
}

// Updated interface to support multiple screenshots
export interface StepScreenshots {
  screenshots: ScreenshotData[];
  // Keep legacy properties for backward compatibility
  secondaryDataUrl?: string;
  secondaryCallouts?: Callout[];
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
  detailedFeedback?: {
    correctFeedback?: string;
    incorrectFeedback?: string;
    optionFeedback?: { [key: string]: string }; // Feedback for each multiple choice option
  };
}

export interface LearningObjective {
  id: string;
  text: string;
  category?: "knowledge" | "skill" | "behavior";
}

// Healthcare-specific content types
export type HealthcareContentType = 
  | "critical-safety" 
  | "hipaa-alert" 
  | "patient-communication"
  | "scenario-guidance"
  | "standard";

export interface HealthcareContent {
  id: string;
  type: HealthcareContentType;
  content: string;
  priority: "high" | "medium" | "low";
  icon?: string;
}

// New content block types for enhanced engagement
export interface ContentBlock {
  id: string;
  type: "text" | "key-takeaway" | "scenario" | "checklist" | "healthcare-alert";
  content: string;
  title?: string; // For titled blocks like scenarios
  healthcareType?: HealthcareContentType; // For healthcare-specific content
  priority?: "high" | "medium" | "low";
}

export interface RevisionHistoryEntry {
  id: string;
  version: string;
  date: string;
  changes: string;
  author: string;
  approved: boolean;
  approver?: string;
  approvalDate?: string;
}

export interface ApprovalSignature {
  id: string;
  role: string;
  name: string;
  signature?: string; // Base64 signature image
  date?: string;
  approved: boolean;
}

export interface SopStep {
  id: string;
  title?: string;
  description: string;
  detailedInstructions?: string;
  notes?: string;
  tags?: string[];
  resources?: StepResource[];
  screenshot: ScreenshotData | null; // Keep for backward compatibility
  screenshots?: ScreenshotData[]; // New array for multiple screenshots
  completed?: boolean;
  fileLink?: string; // Adding this property to fix the error
  fileLinkText?: string; // Adding this property to fix the error
  
  // Enhanced content blocks
  contentBlocks?: ContentBlock[];
  keyTakeaway?: string; // Quick key takeaway field
  estimatedTime?: number; // Estimated time in minutes
  
  // Healthcare-specific content
  healthcareContent?: HealthcareContent[];
  patientSafetyNote?: string;
  hipaaAlert?: string;
  communicationTip?: string;
  
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
  description?: string; // Added description property
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
  
  // Healthcare-specific metadata
  healthcareMetadata?: {
    revisionHistory: RevisionHistoryEntry[];
    approvalSignatures: ApprovalSignature[];
    complianceLevel: "basic" | "hipaa" | "joint-commission";
    patientImpact: "direct" | "indirect" | "administrative";
    criticalityLevel: "routine" | "important" | "critical";
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
export type SubscriptionTier = "free" | "pro" | "pro-learning";

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
  onDeleteStep?: (stepId: string) => void; // Added onDeleteStep property
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
