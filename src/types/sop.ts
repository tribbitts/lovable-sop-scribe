import React from "react";

// Core SOP Document Types
export interface SopDocument {
  id: string;
  title: string;
  description?: string;
  topic: string;
  date: string;
  version?: string;
  lastRevised?: string;
  author?: string;
  logo?: string | null;
  backgroundImage?: string | null;
  companyName: string;
  tableOfContents?: boolean;
  darkMode?: boolean;
  trainingMode?: boolean;
  progressTracking?: {
    enabled: boolean;
    sessionName?: string;
  };
  steps: SopStep[];
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  category?: string;
  estimatedTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  healthcareContent?: HealthcareContent[];
  revisionHistory?: RevisionHistoryEntry[];
  approvalSignatures?: ApprovalSignature[];
  complianceLevel?: 'basic' | 'hipaa' | 'joint-commission';
  patientImpact?: 'direct' | 'indirect' | 'administrative';
  criticalityLevel?: 'routine' | 'important' | 'critical';
}

export interface SopStep {
  id: string;
  title?: string;
  description: string;
  screenshot?: ScreenshotData;
  screenshots?: ScreenshotData[];
  secondaryScreenshot?: ScreenshotData;
  resources: StepResource[];
  order: number;
  estimatedTime?: number;
  isOptional?: boolean;
  prerequisites?: string[];
  warnings?: string[];
  tips?: string[];
  healthcareContent?: HealthcareContent[];
  completed?: boolean;
  enhancedContentBlocks?: any[];
  keyTakeaway?: string;
  detailedInstructions?: string;
  notes?: string;
  fileLink?: string;
  fileLinkText?: string;
  tags?: string[];
  // Additional optional properties for enhanced features
  trainingMode?: boolean;
  quizQuestions?: any[];
  learningObjectives?: string[];
  contentBlocks?: any[];
  patientSafetyNote?: string;
  hipaaAlert?: string;
  communicationTip?: string;
  allowRetakes?: boolean;
  requiredScore?: number;
  itmOnlyContent?: any;
}

export interface StepResource {
  id: string;
  type: 'link' | 'file' | 'video' | 'image' | 'document';
  title: string;
  url: string;
  description?: string;
  fileSize?: string;
  duration?: string;
  itmOnly?: boolean; // For ITM-specific resources
}

export interface ScreenshotData {
  id: string;
  dataUrl: string;
  callouts: Callout[];
  timestamp?: Date;
  filename?: string;
  title?: string;
  description?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  // Additional optional properties for enhanced features
  originalDataUrl?: string;
  secondaryDataUrl?: string;
  secondaryCallouts?: Callout[];
  isCropped?: boolean;
}

// Healthcare-specific types
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
  itmOnly?: boolean; // For ITM-specific content
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

// Callout and Annotation Types
export interface CalloutOverlayProps {
  screenshot: {
    id: string;
    dataUrl: string;
    callouts: Callout[];
  };
  isEditing: boolean;
  onCalloutAdd?: (callout: Omit<Callout, "id">) => void;
  onCalloutUpdate?: (callout: Callout) => void;
  onCalloutDelete?: (calloutId: string) => void;
}

export type CalloutShape = 
  | "circle" 
  | "rectangle" 
  | "arrow" 
  | "number"
  | "blur"
  | "magnifier" 
  | "oval"
  | "polygon"
  | "freehand";

export interface Callout {
  id: string;
  shape: CalloutShape;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  number?: number;
  revealText?: string;
  style?: AdvancedCalloutStyle;
  blurData?: BlurCalloutData;
  magnifierData?: MagnifierCalloutData;
  polygonData?: PolygonCalloutData;
  freehandData?: FreehandCalloutData;
}

export interface AdvancedCalloutStyle {
  opacity?: number;
  borderWidth?: number;
  borderColor?: string;
  fillColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
}

export interface BlurCalloutData {
  intensity?: number;
  type?: "blur" | "pixelate";
}

export interface MagnifierCalloutData {
  zoomLevel?: number;
  showBorder?: boolean;
}

export interface PolygonCalloutData {
  sides?: number;
}

export interface FreehandCalloutData {
  strokeWidth?: number;
  path?: string;
}

// Export and Template Types
export type ExportFormat = 'pdf' | 'html' | 'docx' | 'json' | 'training-module' | 'powerpoint';

export interface ExportOptions {
  format: ExportFormat;
  includeImages: boolean;
  includeTableOfContents?: boolean;
  includeRevisionHistory?: boolean;
  includeSignatures?: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  quality?: 'low' | 'medium' | 'high';
  watermark?: string;
  customization?: any;
  theme?: string;
  mode?: 'standalone' | 'zip';
  // Additional options for enhanced exports
  enhanced?: boolean;
  enhancedOptions?: any;
  includeProgressInfo?: boolean;
}

// Component Props Types
export interface StepCardProps {
  step: SopStep;
  index: number;
  onEdit: (step: SopStep) => void;
  onDelete: (stepId: string) => void;
  onMove: (stepId: string, direction: 'up' | 'down') => void;
  isSelected: boolean;
  onSelect: () => void;
  isActive?: boolean;
  onStepChange?: (stepId: string, field: keyof SopStep, value: any) => void;
  onStepComplete?: (stepId: string, completed: boolean) => void;
  onDeleteStep?: (stepId: string) => void;
}

export interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImageUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  minCropBoxWidth?: number;
  minCropBoxHeight?: number;
  imageDataUrl?: string;
  onCropComplete?: (croppedImageUrl: string) => void;
}

// Subscription Types
export type SubscriptionTier = 'free' | 'pro' | 'pro-complete' | 'pro-learning';

export interface SubscriptionFeatures {
  pdfExports: number;
  htmlExports: number;
  sopLimit: number;
  advancedFeatures: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  analytics: boolean;
  teamCollaboration: boolean;
}

// Living SOP Types (for collaboration features)
export interface SOPComment {
  id: string;
  stepId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  content: string;
  type: 'general' | 'suggestion' | 'issue' | 'question';
  status: 'open' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  reactions?: Array<{
    userId: string;
    emoji: string;
    timestamp: Date;
  }>;
  replies?: SOPComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SOPSuggestion {
  id: string;
  stepId?: string;
  userId: string;
  userName: string;
  suggestedChange: {
    field: string;
    original: string;
    suggested: string;
  };
  reasoning: string;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  impact: 'minor' | 'moderate' | 'major';
  category: 'clarity' | 'accuracy' | 'efficiency' | 'safety' | 'compliance';
  votes?: Array<{
    userId: string;
    vote: 'up' | 'down';
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SOPChangeRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'in-review' | 'approved' | 'rejected' | 'implemented';
  dueDate?: Date;
  changes: Array<{
    stepId?: string;
    type: 'add' | 'modify' | 'delete';
    content: any;
  }>;
  comments: SOPComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RealTimeCollaboration {
  activeUsers: Array<{
    userId: string;
    userName: string;
    avatar?: string;
    lastSeen: Date;
    currentStep?: string;
  }>;
  recentActivity: Array<{
    userId: string;
    userName: string;
    action: string;
    timestamp: Date;
    metadata?: any;
  }>;
  liveCursors: Array<{
    userId: string;
    position: { x: number; y: number };
    color: string;
  }>;
}

export interface SOPAnalytics {
  usage: {
    views: number;
    uniqueViewers: number;
    averageTimeSpent: number;
    completionRate: number;
    dropOffPoints: Array<{
      stepId: string;
      dropOffRate: number;
    }>;
  };
  engagement: {
    comments: number;
    suggestions: number;
    reactions: number;
    shares: number;
  };
  performance: {
    loadTime: number;
    errorRate: number;
    userSatisfaction: number;
  };
}

// Enhanced Export Types
export interface EnhancedExportOptions extends ExportOptions {
  advanced?: AdvancedExportCustomization;
  template?: {
    useCustomTemplate: boolean;
    templateId: string;
  };
  optimization?: {
    imageQuality: 'low' | 'medium' | 'high';
    fileSize: 'compact' | 'balanced' | 'high-quality';
    webOptimized: boolean;
    includeMetadata: boolean;
  };
}

export interface AdvancedExportCustomization {
  brandKit?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    logoUrl?: string;
  };
  layout?: {
    pageSize?: 'A4' | 'US-Letter' | 'Legal' | 'A3';
    orientation?: 'portrait' | 'landscape';
    margins?: 'narrow' | 'normal' | 'wide';
    columnLayout?: 'single' | 'two-column' | 'three-column';
  };
  sections?: {
    includeCoverPage?: boolean;
    includeTableOfContents?: boolean;
    includeGlossary?: boolean;
    includeAppendix?: boolean;
    includeRevisionHistory?: boolean;
    includeSignaturePage?: boolean;
    includeFeedbackQR?: boolean;
  };
  interactivity?: {
    enableClickableLinks?: boolean;
    enableFormFields?: boolean;
    enableDigitalSignatures?: boolean;
    enableBookmarks?: boolean;
    enableComments?: boolean;
  };
}

// Template Ecosystem Types
export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  usageCount: number;
  tags: string[];
  customization: AdvancedExportCustomization;
  preview?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Export Format Type
export type EnhancedExportFormat = 'pdf' | 'html' | 'word' | 'powerpoint' | 'training-module';

// Share Link Types
export interface ShareLinkOptions {
  access: {
    type: 'public' | 'password-protected' | 'time-limited' | 'restricted';
    password?: string;
    expiresAt?: Date;
  };
  permissions: {
    canView: boolean;
    canComment: boolean;
    canSuggestEdits: boolean;
    canDownload: boolean;
    canShare: boolean;
    canPrint: boolean;
    trackViewing: boolean;
  };
  appearance: {
    showHeader: boolean;
    showFooter: boolean;
    showWatermark: boolean;
    theme: 'auto' | 'light' | 'dark';
    hideSOPifyBranding: boolean;
  };
  analytics: {
    enabled: boolean;
    trackPageViews: boolean;
    trackTimeSpent: boolean;
    trackInteractions: boolean;
    trackDownloads: boolean;
    notifyOnAccess: boolean;
  };
}
