
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

export type EnhancedContentBlock = 
  | TextContentBlock 
  | ChecklistContentBlock 
  | TableContentBlock 
  | AccordionContentBlock 
  | AlertContentBlock;

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
