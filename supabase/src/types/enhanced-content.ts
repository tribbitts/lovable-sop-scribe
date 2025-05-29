import { Callout, ScreenshotData } from './sop';

export interface ContentBlockBase {
  id: string;
  type: string;
  order: number;
}

export interface TextContentBlock extends ContentBlockBase {
  type: 'text';
  content: string;
  style?: 'normal' | 'highlight' | 'warning' | 'info';
}

export interface ChecklistContentBlock extends ContentBlockBase {
  type: 'checklist';
  title?: string;
  items: {
    id: string;
    text: string;
    completed?: boolean;
  }[];
}

export interface TableContentBlock extends ContentBlockBase {
  type: 'table';
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface AccordionContentBlock extends ContentBlockBase {
  type: 'accordion';
  title: string;
  content: string;
  defaultOpen?: boolean;
}

export interface AlertContentBlock extends ContentBlockBase {
  type: 'alert';
  variant: 'default' | 'destructive' | 'warning' | 'info';
  title?: string;
  content: string;
}

// New content blocks for enhanced functionality

export interface DecisionTreeNode {
  id: string;
  question: string;
  condition?: string; // For conditional logic
  targetStepId?: string; // Which step to navigate to
  children?: DecisionTreeNode[];
  isEndNode?: boolean;
  endMessage?: string;
}

export interface DecisionTreeContentBlock extends ContentBlockBase {
  type: 'decision-tree';
  title: string;
  description?: string;
  rootNode: DecisionTreeNode;
  // Styling options
  style?: {
    nodeColor?: string;
    connectorColor?: string;
    layout?: 'vertical' | 'horizontal' | 'radial';
  };
}

export interface EmbedContentBlock extends ContentBlockBase {
  type: 'embed';
  title?: string;
  url: string;
  embedType: 'youtube' | 'vimeo' | 'google-slides' | 'miro' | 'loom' | 'soundcloud' | 'generic';
  embedCode?: string; // Sanitized embed HTML
  metadata?: {
    title?: string;
    description?: string;
    thumbnail?: string;
    duration?: string;
    author?: string;
  };
  // Responsive settings
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'custom';
  customWidth?: number;
  customHeight?: number;
  // Security settings
  allowFullscreen?: boolean;
  allowAutoplay?: boolean;
}

export interface CodeContentBlock extends ContentBlockBase {
  type: 'code';
  title?: string;
  code: string;
  language: string; // Programming language for syntax highlighting
  theme?: 'dark' | 'light' | 'auto';
  showLineNumbers?: boolean;
  highlightLines?: number[]; // Lines to highlight
  fileName?: string;
  // Additional features
  allowCopy?: boolean;
  showLanguage?: boolean;
  wrap?: boolean;
}

export type EnhancedContentBlock = 
  | TextContentBlock 
  | ChecklistContentBlock 
  | TableContentBlock 
  | AccordionContentBlock 
  | AlertContentBlock
  | DecisionTreeContentBlock
  | EmbedContentBlock
  | CodeContentBlock;

export interface EnhancedCallout extends Callout {
  sequenceNumber?: number;
  hotspotData?: {
    hoverText?: string;
    clickAction?: 'reveal-text' | 'link' | 'highlight';
    linkUrl?: string;
    revealContent?: string;
  };
}

export interface EnhancedScreenshotData extends ScreenshotData {
  callouts: EnhancedCallout[];
  annotations?: {
    id: string;
    type: 'arrow' | 'shape' | 'text-overlay';
    data: any;
  }[];
}
