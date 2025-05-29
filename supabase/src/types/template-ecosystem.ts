// Template Ecosystem Types for SOPify
// Comprehensive template marketplace and community features

export interface SOPTemplate {
  id: string;
  name: string;
  description: string;
  shortDescription: string; // For cards/listings
  category: TemplateCategory;
  subcategory?: string;
  
  // Content structure
  structure: {
    steps: TemplateStep[];
    estimatedTime: number; // Total estimated completion time
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    requiredRoles?: string[]; // Roles needed to complete
  };
  
  // Metadata
  metadata: {
    industry: Industry[];
    useCase: UseCase[];
    complianceFrameworks?: ComplianceFramework[];
    languages: string[]; // Supported languages
    lastUpdated: Date;
    version: string;
  };
  
  // Media assets
  assets: {
    thumbnail: string;
    preview?: string; // Preview image or video
    screenshots: string[];
    demoUrl?: string; // Interactive demo
  };
  
  // Community features
  community: {
    rating: number; // 1-5 stars
    reviewCount: number;
    downloadCount: number;
    usageCount: number;
    favoriteCount: number;
    recentReviews: TemplateReview[];
  };
  
  // Author information
  author: {
    id: string;
    name: string;
    organization?: string;
    avatar?: string;
    verified: boolean;
    expertBadges?: ExpertBadge[];
  };
  
  // Template configuration
  configuration: {
    isPublic: boolean;
    isPremium: boolean;
    price?: number; // For premium templates
    license: LicenseType;
    customizable: boolean;
    canFork: boolean; // Allow community derivatives
    regions?: string[]; // Geographic restrictions
  };
  
  // Technical details
  technical: {
    sopifyVersion: string; // Minimum SOPify version required
    features: TemplateFeature[]; // Required SOPify features
    integrations?: string[]; // External integrations used
    dependencies?: string[]; // Other templates required
  };
  
  // Template data
  templateData: SOPTemplateData;
  
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
}

export interface TemplateStep {
  id: string;
  title: string;
  description: string;
  detailedInstructions?: string;
  estimatedTime: number; // In minutes
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Template-specific content
  placeholders: Array<{
    id: string;
    type: 'text' | 'image' | 'file' | 'selection' | 'calculation';
    label: string;
    description?: string;
    required: boolean;
    defaultValue?: any;
    validation?: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
      options?: string[]; // For selection type
    };
  }>;
  
  // Enhanced content blocks
  contentBlocks?: Array<{
    type: string;
    template: any; // Template for the content block
    configurable: boolean;
  }>;
  
  // Conditional logic
  conditions?: Array<{
    if: string; // Condition expression
    then: 'show' | 'hide' | 'require' | 'skip';
    target?: string; // Target element ID
  }>;
}

export interface SOPTemplateData {
  title: string;
  topic: string;
  description: string;
  companyName: string; // Placeholder
  
  // Template-specific settings
  settings: {
    allowCustomization: boolean;
    requireApproval: boolean; // For generated SOPs
    autoUpdate: boolean; // Auto-update when template updates
    tracking: boolean; // Track usage analytics
  };
  
  // Placeholder mappings
  placeholders: Record<string, {
    label: string;
    type: 'text' | 'number' | 'date' | 'selection' | 'file' | 'company-info';
    description?: string;
    required: boolean;
    defaultValue?: any;
    validation?: any;
  }>;
  
  // Customization options
  customization: {
    branding: {
      allowLogoChange: boolean;
      allowColorChange: boolean;
      allowFontChange: boolean;
    };
    content: {
      allowStepModification: boolean;
      allowStepAddition: boolean;
      allowStepDeletion: boolean;
      protectedSections?: string[]; // Non-modifiable sections
    };
    structure: {
      allowReordering: boolean;
      allowBranching: boolean; // Conditional flows
      minSteps?: number;
      maxSteps?: number;
    };
  };
}

export type TemplateCategory = 
  | 'onboarding' 
  | 'training' 
  | 'compliance' 
  | 'safety' 
  | 'operations' 
  | 'hr' 
  | 'it' 
  | 'finance' 
  | 'customer-service' 
  | 'quality-assurance' 
  | 'marketing' 
  | 'sales' 
  | 'project-management' 
  | 'emergency-response'
  | 'maintenance'
  | 'general';

export type Industry = 
  | 'healthcare' 
  | 'manufacturing' 
  | 'retail' 
  | 'finance' 
  | 'technology' 
  | 'education' 
  | 'government' 
  | 'construction' 
  | 'hospitality' 
  | 'transportation' 
  | 'energy' 
  | 'agriculture' 
  | 'legal' 
  | 'non-profit' 
  | 'consulting'
  | 'real-estate'
  | 'media'
  | 'telecommunications';

export type UseCase = 
  | 'employee-onboarding' 
  | 'equipment-operation' 
  | 'safety-procedures' 
  | 'customer-support' 
  | 'incident-response' 
  | 'quality-control' 
  | 'data-management' 
  | 'compliance-audit' 
  | 'training-program' 
  | 'workflow-optimization'
  | 'crisis-management'
  | 'vendor-management'
  | 'product-launch'
  | 'change-management';

export type ComplianceFramework = 
  | 'iso-9001' 
  | 'iso-27001' 
  | 'hipaa' 
  | 'gdpr' 
  | 'sox' 
  | 'pci-dss' 
  | 'osha' 
  | 'fda-21-cfr-part-11' 
  | 'joint-commission' 
  | 'coso'
  | 'nist'
  | 'cobit'
  | 'itil';

export type LicenseType = 
  | 'mit' 
  | 'apache-2.0' 
  | 'cc-by' 
  | 'cc-by-sa' 
  | 'cc-by-nc' 
  | 'proprietary' 
  | 'custom';

export type TemplateFeature = 
  | 'enhanced-callouts' 
  | 'decision-trees' 
  | 'code-blocks' 
  | 'embed-content' 
  | 'advanced-export' 
  | 'collaboration' 
  | 'analytics' 
  | 'workflows' 
  | 'versioning'
  | 'integrations'
  | 'custom-branding';

export interface ExpertBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'industry' | 'compliance' | 'feature' | 'community';
  earnedAt: Date;
}

export interface TemplateReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 stars
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  recommendedFor?: string[];
  verified: boolean; // Verified purchase/usage
  helpful: number; // Helpful votes
  createdAt: Date;
  updatedAt: Date;
  
  // Review metadata
  usage: {
    industry?: Industry;
    useCase?: UseCase;
    teamSize?: 'small' | 'medium' | 'large' | 'enterprise';
    experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  };
  
  // Author response
  authorResponse?: {
    content: string;
    respondedAt: Date;
  };
}

export interface TemplateCollection {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  templateIds: string[];
  
  // Collection metadata
  metadata: {
    category: TemplateCategory;
    industry?: Industry[];
    useCase?: UseCase[];
    curator: {
      id: string;
      name: string;
      organization?: string;
      verified: boolean;
    };
    tags: string[];
  };
  
  // Community features
  community: {
    rating: number;
    reviewCount: number;
    downloadCount: number;
    favoriteCount: number;
  };
  
  isOfficial: boolean; // SOPify curated collection
  isPremium: boolean;
  price?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateBuilder {
  // Step-by-step template creation wizard
  currentStep: number;
  totalSteps: number;
  
  // Wizard steps
  steps: {
    basics: TemplateBasics;
    structure: TemplateStructure;
    content: TemplateContent;
    customization: TemplateCustomization;
    metadata: TemplateMetadata;
    preview: TemplatePreview;
    publish: TemplatePublish;
  };
  
  // Validation
  validation: {
    isValid: boolean;
    errors: Array<{
      step: string;
      field: string;
      message: string;
    }>;
    warnings: Array<{
      step: string;
      field: string;
      message: string;
    }>;
  };
  
  // Auto-save
  autoSave: {
    enabled: boolean;
    lastSaved?: Date;
    isDirty: boolean;
  };
}

export interface TemplateBasics {
  name: string;
  shortDescription: string;
  description: string;
  category: TemplateCategory;
  subcategory?: string;
  industry: Industry[];
  useCase: UseCase[];
  thumbnail?: File | string;
  previewImages: (File | string)[];
}

export interface TemplateStructure {
  steps: TemplateStep[];
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requiredRoles: string[];
  
  // Structure options
  options: {
    allowReordering: boolean;
    allowStepAddition: boolean;
    allowStepDeletion: boolean;
    minSteps: number;
    maxSteps: number;
  };
}

export interface TemplateContent {
  placeholders: Record<string, any>;
  contentBlocks: any[];
  conditionalLogic: any[];
  
  // Content validation
  validation: {
    requiredFields: string[];
    contentGuidelines: string[];
    qualityChecks: Array<{
      type: 'grammar' | 'clarity' | 'completeness' | 'accessibility';
      passed: boolean;
      suggestions?: string[];
    }>;
  };
}

export interface TemplateCustomization {
  branding: {
    allowLogoChange: boolean;
    allowColorChange: boolean;
    allowFontChange: boolean;
    brandingGuidelines?: string;
  };
  
  content: {
    allowStepModification: boolean;
    protectedSections: string[];
    editingGuidelines?: string;
  };
  
  licensing: {
    license: LicenseType;
    attribution: boolean;
    commercialUse: boolean;
    modifications: boolean;
    distribution: boolean;
  };
}

export interface TemplateMetadata {
  complianceFrameworks: ComplianceFramework[];
  languages: string[];
  requiredFeatures: TemplateFeature[];
  integrations: string[];
  dependencies: string[];
  
  // SEO and discovery
  tags: string[];
  keywords: string[];
  searchTerms: string[];
}

export interface TemplatePreview {
  generatedSOP: any; // Preview of generated SOP
  previewMode: 'desktop' | 'tablet' | 'mobile';
  testData: Record<string, any>; // Test placeholder data
  
  // Preview analytics
  viewTime: number;
  interactionPoints: Array<{
    element: string;
    action: string;
    timestamp: Date;
  }>;
}

export interface TemplatePublish {
  visibility: 'private' | 'organization' | 'public';
  pricing: {
    isFree: boolean;
    price?: number;
    currency?: string;
    pricingModel?: 'one-time' | 'subscription' | 'usage-based';
  };
  
  // Publication settings
  settings: {
    autoUpdate: boolean;
    versionControl: boolean;
    analytics: boolean;
    communityFeatures: boolean;
  };
  
  // Legal compliance
  compliance: {
    termsAccepted: boolean;
    contentPolicy: boolean;
    dataPrivacy: boolean;
    intellectualProperty: boolean;
  };
}

export interface TemplateMarketplace {
  // Featured content
  featured: {
    templates: SOPTemplate[];
    collections: TemplateCollection[];
    newReleases: SOPTemplate[];
    trending: SOPTemplate[];
  };
  
  // Categories and filters
  categories: Array<{
    id: TemplateCategory;
    name: string;
    description: string;
    templateCount: number;
    subcategories?: Array<{
      id: string;
      name: string;
      templateCount: number;
    }>;
  }>;
  
  // Search and discovery
  search: {
    query: string;
    filters: MarketplaceFilters;
    results: TemplateSearchResult[];
    suggestions: string[];
    facets: SearchFacets;
  };
  
  // Community features
  community: {
    topAuthors: Array<{
      author: SOPTemplate['author'];
      templateCount: number;
      totalDownloads: number;
      averageRating: number;
    }>;
    recentReviews: TemplateReview[];
    discussionTopics: Array<{
      id: string;
      title: string;
      category: string;
      replies: number;
      lastActivity: Date;
    }>;
  };
}

export interface MarketplaceFilters {
  category?: TemplateCategory[];
  industry?: Industry[];
  useCase?: UseCase[];
  compliance?: ComplianceFramework[];
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
  price?: 'free' | 'premium' | 'all';
  rating?: number; // Minimum rating
  features?: TemplateFeature[];
  language?: string[];
  lastUpdated?: 'week' | 'month' | 'quarter' | 'year';
  author?: {
    verified?: boolean;
    organization?: string;
  };
}

export interface TemplateSearchResult {
  template: SOPTemplate;
  relevanceScore: number;
  matchedFields: string[];
  highlightedContent: Record<string, string>; // Highlighted search matches
}

export interface SearchFacets {
  categories: Array<{ value: TemplateCategory; count: number }>;
  industries: Array<{ value: Industry; count: number }>;
  useCases: Array<{ value: UseCase; count: number }>;
  pricing: Array<{ value: 'free' | 'premium'; count: number }>;
  features: Array<{ value: TemplateFeature; count: number }>;
  ratings: Array<{ value: number; count: number }>;
}

export interface TemplateAnalytics {
  templateId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Usage metrics
  usage: {
    views: number;
    downloads: number;
    activeUsage: number; // Currently in use
    completions: number; // Fully completed SOPs
    averageCompletionTime: number;
  };
  
  // User engagement
  engagement: {
    ratings: {
      average: number;
      distribution: Record<number, number>; // 1-5 star distribution
      totalReviews: number;
    };
    feedback: {
      positiveCount: number;
      negativeCount: number;
      commonIssues: Array<{
        issue: string;
        count: number;
        severity: 'low' | 'medium' | 'high';
      }>;
      featureRequests: Array<{
        request: string;
        votes: number;
      }>;
    };
  };
  
  // Performance metrics
  performance: {
    loadTime: number;
    errorRate: number;
    abandonmentRate: number;
    conversionRate: number; // View to download
  };
  
  // Geographic and demographic data
  demographics: {
    topCountries: Array<{ country: string; count: number }>;
    topIndustries: Array<{ industry: Industry; count: number }>;
    userTypes: Array<{ type: string; count: number }>;
    teamSizes: Array<{ size: string; count: number }>;
  };
  
  // Revenue analytics (for premium templates)
  revenue?: {
    totalRevenue: number;
    averageOrderValue: number;
    refundRate: number;
    churkRate: number;
  };
}

export interface UserTemplateLibrary {
  userId: string;
  templates: {
    created: SOPTemplate[];
    downloaded: Array<{
      template: SOPTemplate;
      downloadedAt: Date;
      version: string;
      customizations?: any;
    }>;
    favorites: Array<{
      templateId: string;
      favoritedAt: Date;
    }>;
    inProgress: Array<{
      templateId: string;
      builderState: TemplateBuilder;
      lastModified: Date;
    }>;
  };
  
  // User preferences
  preferences: {
    favoriteCategories: TemplateCategory[];
    favoriteIndustries: Industry[];
    notificationSettings: {
      newTemplates: boolean;
      updates: boolean;
      reviews: boolean;
      community: boolean;
    };
  };
  
  // Achievement system
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
    badge: ExpertBadge;
  }>;
}

// Template deployment and management
export interface TemplateDeployment {
  id: string;
  templateId: string;
  organizationId: string;
  deployedBy: string;
  
  // Deployment configuration
  configuration: {
    autoUpdate: boolean;
    requireApproval: boolean;
    customBranding: any;
    accessControl: {
      allowedRoles: string[];
      allowedUsers: string[];
      departmentRestrictions?: string[];
    };
  };
  
  // Usage tracking
  usage: {
    totalGenerations: number;
    activeSOPs: number;
    lastUsed: Date;
    popularSteps: Array<{
      stepId: string;
      usageCount: number;
      averageTime: number;
    }>;
  };
  
  // Organization customizations
  customizations: {
    branding: any;
    contentModifications: any;
    workflowIntegrations: any;
    approvalProcesses: any;
  };
  
  deployedAt: Date;
  lastUpdated: Date;
  status: 'active' | 'paused' | 'archived';
} 