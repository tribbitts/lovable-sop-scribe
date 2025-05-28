// Living SOP Types - Enhanced feedback and collaboration features
// Extends the base SOP system with real-time collaboration and update mechanisms

export interface SOPComment {
  id: string;
  stepId?: string; // Optional - can be document-level comments
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  content: string;
  type: 'general' | 'suggestion' | 'issue' | 'question' | 'approval';
  status: 'open' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  position?: {
    x: number;
    y: number;
    element?: string; // CSS selector or element ID
  };
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: 'image' | 'document' | 'video' | 'audio';
    size: number;
  }>;
  mentions?: string[]; // User IDs mentioned in the comment
  reactions?: Array<{
    userId: string;
    emoji: string;
    timestamp: Date;
  }>;
  thread?: SOPComment[]; // Nested replies
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface SOPSuggestion {
  id: string;
  stepId: string;
  userId: string;
  userName: string;
  suggestedChange: {
    field: 'title' | 'description' | 'instructions' | 'screenshot' | 'content-block';
    original: any;
    suggested: any;
    elementId?: string; // For content blocks or specific elements
  };
  reasoning: string;
  status: 'pending' | 'accepted' | 'rejected' | 'under-review';
  votes?: Array<{
    userId: string;
    vote: 'approve' | 'reject';
    reason?: string;
    timestamp: Date;
  }>;
  impact: 'minor' | 'moderate' | 'major';
  category: 'content' | 'structure' | 'accuracy' | 'clarity' | 'safety' | 'compliance';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SOPChangeRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  requesterName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'update' | 'addition' | 'removal' | 'restructure';
  affectedSteps: string[];
  businessJustification: string;
  proposedChanges: Array<{
    stepId: string;
    changeType: 'modify' | 'add' | 'remove';
    details: string;
    before?: any;
    after?: any;
  }>;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'implemented';
  reviewers: Array<{
    userId: string;
    userName: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    reviewedAt?: Date;
  }>;
  timeline: Array<{
    id: string;
    action: string;
    userId: string;
    userName: string;
    timestamp: Date;
    details?: string;
  }>;
  dueDate?: Date;
  implementationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SOPVersion {
  id: string;
  versionNumber: string;
  title: string;
  description?: string;
  changes: Array<{
    type: 'added' | 'modified' | 'removed';
    description: string;
    stepId?: string;
    details?: string;
  }>;
  createdBy: string;
  creatorName: string;
  createdAt: Date;
  approvedBy?: string;
  approverName?: string;
  approvedAt?: Date;
  status: 'draft' | 'pending-approval' | 'approved' | 'archived';
  parentVersionId?: string;
  branchName?: string; // For branching versions
  mergedIntoMainAt?: Date;
}

export interface SOPNotification {
  id: string;
  userId: string;
  type: 'comment' | 'suggestion' | 'change-request' | 'approval-needed' | 'version-update' | 'mention' | 'due-date';
  title: string;
  message: string;
  sopId: string;
  sopTitle: string;
  relatedId?: string; // Comment, suggestion, or change request ID
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export interface SOPReviewCycle {
  id: string;
  sopId: string;
  type: 'scheduled' | 'triggered' | 'ad-hoc';
  reviewers: Array<{
    userId: string;
    userName: string;
    role: string;
    isRequired: boolean;
    status: 'pending' | 'in-progress' | 'completed' | 'skipped';
    startedAt?: Date;
    completedAt?: Date;
    comments?: string;
    recommendations?: Array<{
      type: 'keep' | 'modify' | 'remove' | 'add';
      description: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  }>;
  schedule: {
    frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'custom';
    dayOfMonth?: number;
    daysOfWeek?: number[]; // 0-6, Sunday to Saturday
    customCron?: string;
  };
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
  dueDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  nextReviewDate?: Date;
  remindersSent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SOPAnalytics {
  sopId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  usage: {
    views: number;
    uniqueViewers: number;
    downloads: number;
    averageTimeSpent: number;
    completionRate: number;
    stepCompletionRates: Array<{
      stepId: string;
      completionRate: number;
      averageTimeSpent: number;
    }>;
  };
  engagement: {
    comments: number;
    suggestions: number;
    shares: number;
    ratings: Array<{
      userId: string;
      rating: number;
      feedback?: string;
      timestamp: Date;
    }>;
    averageRating: number;
  };
  feedback: {
    totalFeedback: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    topIssues: Array<{
      category: string;
      count: number;
      severity: 'low' | 'medium' | 'high';
    }>;
    improvementSuggestions: Array<{
      suggestion: string;
      count: number;
      votes: number;
    }>;
  };
  compliance: {
    reviewsCompleted: number;
    reviewsOverdue: number;
    averageReviewTime: number;
    complianceScore: number; // 0-100
    lastReviewDate?: Date;
    nextReviewDate?: Date;
  };
}

export interface SOPWorkflow {
  id: string;
  name: string;
  description: string;
  sopId: string;
  triggers: Array<{
    type: 'schedule' | 'event' | 'condition';
    configuration: any;
  }>;
  steps: Array<{
    id: string;
    type: 'notification' | 'approval' | 'review' | 'update' | 'archive';
    name: string;
    configuration: any;
    conditions?: any;
    assignees?: string[];
    dueDate?: Date;
    status: 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed';
  }>;
  status: 'active' | 'paused' | 'completed' | 'failed';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;
}

export interface EnhancedFeedbackOptions {
  enableRealTimeComments: boolean;
  enableSuggestions: boolean;
  enableChangeRequests: boolean;
  enableVersioning: boolean;
  enableAnalytics: boolean;
  enableWorkflows: boolean;
  moderationSettings: {
    requireApproval: boolean;
    allowAnonymous: boolean;
    enableProfanityFilter: boolean;
    autoResolveOldComments: boolean;
    autoResolveAfterDays: number;
  };
  notificationSettings: {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    webhookUrl?: string;
    digestFrequency: 'immediate' | 'daily' | 'weekly';
  };
  accessControl: {
    whoCanComment: 'anyone' | 'authenticated' | 'specified-users' | 'reviewers-only';
    whoCanSuggest: 'anyone' | 'authenticated' | 'specified-users' | 'reviewers-only';
    whoCanApprove: 'specified-users' | 'reviewers-only';
    reviewerUsers: string[];
    approverUsers: string[];
  };
}

export interface RealTimeCollaboration {
  activeUsers: Array<{
    userId: string;
    userName: string;
    avatar?: string;
    currentStep?: string;
    lastSeen: Date;
    isEditing?: boolean;
    editingElement?: string;
  }>;
  liveCursors: Array<{
    userId: string;
    position: { x: number; y: number };
    element?: string;
  }>;
  ongoingEdits: Array<{
    userId: string;
    elementId: string;
    type: 'text' | 'content-block' | 'screenshot';
    startedAt: Date;
  }>;
  recentActivity: Array<{
    userId: string;
    userName: string;
    action: string;
    timestamp: Date;
    details?: any;
  }>;
}

// Integration with existing SOP types
export interface EnhancedSopDocument {
  // ... extends base SopDocument
  collaboration?: {
    enabled: boolean;
    comments: SOPComment[];
    suggestions: SOPSuggestion[];
    changeRequests: SOPChangeRequest[];
    activeReviewCycle?: SOPReviewCycle;
    realTime?: RealTimeCollaboration;
  };
  versioning?: {
    currentVersion: SOPVersion;
    versionHistory: SOPVersion[];
    branchingEnabled: boolean;
  };
  analytics?: SOPAnalytics;
  workflows?: SOPWorkflow[];
  feedbackSettings?: EnhancedFeedbackOptions;
  lastModified: {
    timestamp: Date;
    userId: string;
    userName: string;
    changes: string[];
  };
} 