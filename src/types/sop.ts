
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
}

export interface SopStep {
  id: string;
  description: string;
  screenshot: ScreenshotData | null;
}

export interface SopDocument {
  title: string;
  topic: string;
  date: string;
  logo: string | null;
  steps: SopStep[];
  companyName: string;
}

export interface AppSettings {
  companyName: string;
}
