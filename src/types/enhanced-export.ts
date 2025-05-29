// Enhanced Export Types for SOPify
// Extends the base export system with advanced customization and sharing features

import { ExportOptions, ExportFormat } from './sop';

export interface AdvancedExportCustomization {
  // Visual theming
  brandKit?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl?: string;
    watermarkUrl?: string;
    fontFamily: 'system' | 'serif' | 'sans-serif' | 'monospace' | 'custom';
    customFontUrl?: string;
  };
  
  // Layout options
  layout?: {
    pageSize: 'A4' | 'US-Letter' | 'Legal' | 'A3' | 'custom';
    orientation: 'portrait' | 'landscape';
    margins: 'narrow' | 'normal' | 'wide' | 'custom';
    customMargins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    columnLayout: 'single' | 'two-column' | 'three-column';
    headerHeight?: number;
    footerHeight?: number;
  };
  
  // Content organization
  sections?: {
    includeCoverPage: boolean;
    includeTableOfContents: boolean;
    includeGlossary: boolean;
    includeAppendix: boolean;
    includeRevisionHistory: boolean;
    includeSignaturePage: boolean;
    includeFeedbackQR: boolean;
    customSections?: Array<{
      id: string;
      title: string;
      content: string;
      position: 'before-content' | 'after-content' | 'appendix';
    }>;
  };
  
  // Advanced features
  interactivity?: {
    enableClickableLinks: boolean;
    enableFormFields: boolean;
    enableDigitalSignatures: boolean;
    enableBookmarks: boolean;
    enableComments: boolean;
    passwordProtection?: {
      enabled: boolean;
      password?: string;
      permissions: {
        canPrint: boolean;
        canCopy: boolean;
        canModify: boolean;
        canAddComments: boolean;
      };
    };
  };
}

export interface ShareLinkOptions {
  // Access control
  access: {
    type: 'public' | 'restricted' | 'password-protected' | 'time-limited';
    password?: string;
    allowedEmails?: string[];
    allowedDomains?: string[];
    expiresAt?: Date;
    maxViews?: number;
  };
  
  // Viewer permissions
  permissions: {
    canView: boolean;
    canComment: boolean;
    canSuggestEdits: boolean;
    canDownload: boolean;
    canShare: boolean;
    canPrint: boolean;
    trackViewing: boolean;
  };
  
  // Customization
  appearance: {
    showHeader: boolean;
    showFooter: boolean;
    showWatermark: boolean;
    theme: 'light' | 'dark' | 'auto' | 'branded';
    hideSOPifyBranding: boolean;
  };
  
  // Analytics
  analytics: {
    enabled: boolean;
    trackPageViews: boolean;
    trackTimeSpent: boolean;
    trackInteractions: boolean;
    trackDownloads: boolean;
    notifyOnAccess: boolean;
    notificationEmail?: string;
  };
}

export interface EnhancedExportOptions extends ExportOptions {
  // Enhanced customization
  advanced?: AdvancedExportCustomization;
  
  // Share link generation
  shareLink?: ShareLinkOptions;
  
  // Batch export options
  batch?: {
    includeMultipleFormats: boolean;
    formats: ExportFormat[];
    createZipBundle: boolean;
    separateFiles: boolean;
  };
  
  // Quality and optimization
  optimization?: {
    imageQuality: 'low' | 'medium' | 'high' | 'lossless';
    fileSize: 'compact' | 'balanced' | 'quality';
    webOptimized: boolean;
    includeMetadata: boolean;
  };
  
  // Template options
  template?: {
    useCustomTemplate: boolean;
    templateId?: string;
    templateData?: Record<string, any>;
  };
}

export interface ShareableDocument {
  id: string;
  documentId: string;
  title: string;
  shareUrl: string;
  accessType: ShareLinkOptions['access']['type'];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  viewCount: number;
  maxViews?: number;
  isActive: boolean;
  analytics?: DocumentAnalytics;
}

export interface DocumentAnalytics {
  totalViews: number;
  uniqueViewers: number;
  averageTimeSpent: number;
  downloadCount: number;
  commentCount: number;
  lastAccessed?: Date;
  topReferrers: Array<{ source: string; count: number }>;
  viewsByDate: Array<{ date: string; views: number }>;
  deviceTypes: Array<{ type: string; count: number }>;
  geographicData?: Array<{ country: string; count: number }>;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'healthcare' | 'education' | 'legal' | 'technical' | 'custom';
  thumbnail?: string;
  customization: AdvancedExportCustomization;
  isPublic: boolean;
  authorId?: string;
  usageCount: number;
  rating?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// PDF Generation enhancements
export interface AdvancedPdfOptions {
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
    producer?: string;
  };
  
  security?: {
    userPassword?: string;
    ownerPassword?: string;
    permissions: {
      printing: 'none' | 'lowRes' | 'highRes';
      modifying: boolean;
      copying: boolean;
      annotating: boolean;
      fillingForms: boolean;
      contentAccessibility: boolean;
      documentAssembly: boolean;
    };
  };
  
  structure?: {
    addBookmarks: boolean;
    addTags: boolean;
    enableAccessibility: boolean;
    includeOutline: boolean;
  };
}

// HTML Export enhancements
export interface AdvancedHtmlOptions {
  responsive?: {
    enabled: boolean;
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    mobileFirst: boolean;
  };
  
  seo?: {
    enabled: boolean;
    metaTags: Array<{ name: string; content: string }>;
    structuredData: boolean;
    sitemap: boolean;
  };
  
  performance?: {
    lazyLoading: boolean;
    imageOptimization: boolean;
    minifyCode: boolean;
    enableCaching: boolean;
    cdnResources: boolean;
  };
  
  accessibility?: {
    enabled: boolean;
    altTextGeneration: boolean;
    keyboardNavigation: boolean;
    screenReaderOptimized: boolean;
    highContrast: boolean;
  };
}

export type EnhancedExportFormat = ExportFormat | 'docx' | 'powerpoint' | 'epub' | 'markdown';

export interface ExportJobStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedCompletion?: Date;
  resultUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
} 