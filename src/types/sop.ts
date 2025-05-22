
export type CalloutShape = "circle" | "rectangle";

export interface Callout {
  id: string;
  shape: CalloutShape;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenshotData {
  id: string;
  dataUrl: string;
  callouts: Callout[];
  secondaryDataUrl?: string;
  secondaryCallouts?: Callout[];
}

export interface SopStep {
  id: string;
  description: string;
  title?: string;
  detailedInstructions?: string;
  notes?: string;
  fileLink?: string;
  fileLinkText?: string;
  screenshot: ScreenshotData | null;
}

export interface SopDocument {
  title: string;
  topic: string;
  date: string;
  logo: string | null;
  backgroundImage?: string | null;
  steps: SopStep[];
  companyName: string;
}

export interface AppSettings {
  companyName: string;
}

// Export options
export type ExportFormat = "pdf" | "html";

// Subscription tiers
export type SubscriptionTier = "free" | "pro-pdf" | "pro-html" | "pro-complete";
