import React from "react";

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
