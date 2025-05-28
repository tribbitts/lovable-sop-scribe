
import React from "react";

// Core SOP Document Types
export interface SopDocument {
  id: string;
  title: string;
  description?: string;
  steps: SopStep[];
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  version?: string;
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
  resources: StepResource[];
  order: number;
  estimatedTime?: number;
  isOptional?: boolean;
  prerequisites?: string[];
  warnings?: string[];
  tips?: string[];
  healthcareContent?: HealthcareContent[];
}

export interface StepResource {
  id: string;
  type: 'link' | 'file' | 'video' | 'image' | 'document';
  title: string;
  url: string;
  description?: string;
  fileSize?: string;
  duration?: string;
}

export interface ScreenshotData {
  id: string;
  dataUrl: string;
  callouts: Callout[];
  timestamp?: Date;
  filename?: string;
  dimensions?: {
    width: number;
    height: number;
  };
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
export type ExportFormat = 'pdf' | 'html' | 'docx' | 'json';

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
}

export interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImageUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  minCropBoxWidth?: number;
  minCropBoxHeight?: number;
}

// Subscription Types
export type SubscriptionTier = 'free' | 'pro' | 'pro-complete';

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
