
import React, { createContext, useState, useContext, ReactNode } from "react";
import { SopDocument, SopStep, Callout, StepResource, ExportFormat } from "../types/sop";
import { toast } from "@/hooks/use-toast";
import { StorageManager } from "@/utils/storageManager";
import { DocumentManager } from "./managers/DocumentManager";
import { StepManager } from "./managers/StepManager";
import { ScreenshotManager } from "./managers/ScreenshotManager";

interface SopContextType {
  sopDocument: SopDocument;
  setSopTitle: (title: string) => void;
  setSopTopic: (topic: string) => void;
  setSopDate: (date: string) => void;
  setSopDescription: (description: string) => void; // Added description setter
  setLogo: (logo: string | null) => void;
  setBackgroundImage: (image: string | null) => void;
  setCompanyName: (name: string) => void; // Fixed function name
  
  // Step management
  addStep: () => void;
  addStepFromTemplate: (templateType: "standard" | "knowledge-check" | "scenario" | "resource-focus") => void;
  updateStep: (stepId: string, field: keyof SopStep, value: any) => void;
  moveStepUp: (stepId: string) => void;
  moveStepDown: (stepId: string) => void;
  deleteStep: (stepId: string) => void;
  duplicateStep: (stepId: string) => void;
  toggleStepCompletion: (stepId: string) => void;
  
  // Screenshot management
  setStepScreenshot: (stepId: string, dataUrl: string) => void;
  setStepSecondaryScreenshot: (stepId: string, dataUrl: string) => void;
  cropStepScreenshot: (stepId: string, croppedDataUrl: string) => void;
  undoCropStepScreenshot: (stepId: string) => void;
  
  // Multiple screenshots management
  addStepScreenshot: (stepId: string, dataUrl: string, title?: string, description?: string) => void;
  updateStepScreenshot: (stepId: string, screenshotId: string, updates: Partial<any>) => void;
  deleteStepScreenshot: (stepId: string, screenshotId: string) => void;
  reorderStepScreenshots: (stepId: string, fromIndex: number, toIndex: number) => void;
  cropSpecificScreenshot: (stepId: string, screenshotId: string, croppedDataUrl: string) => void;
  undoCropSpecificScreenshot: (stepId: string, screenshotId: string) => void;
  
  // Callout management
  addCallout: (stepId: string, callout: Omit<Callout, "id">) => void;
  updateCallout: (stepId: string, callout: Callout) => void;
  deleteCallout: (stepId: string, calloutId: string) => void;
  addSecondaryCallout: (stepId: string, callout: Omit<Callout, "id">) => void;
  updateSecondaryCallout: (stepId: string, callout: Callout) => void;
  deleteSecondaryCallout: (stepId: string, calloutId: string) => void;
  
  // Tags and resources
  addStepTag: (stepId: string, tag: string) => void;
  removeStepTag: (stepId: string, tag: string) => void;
  addStepResource: (stepId: string, resource: StepResource) => void;
  removeStepResource: (stepId: string, resourceId: string) => void;
  updateStepResource: (stepId: string, resourceId: string, updates: Partial<StepResource>) => void;
  
  // Document management
  saveDocumentToJSON: () => void;
  loadDocumentFromJSON: (jsonData: string) => void;
  resetDocument: () => void;
  
  // Export functionality
  exportDocument: (format: ExportFormat, options?: any) => Promise<void>;
  getPdfPreview: () => Promise<string>;
  
  // Progress tracking
  getCompletedStepsCount: () => number;
  getProgressPercentage: () => number;
  
  // Settings
  setTableOfContents: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setTrainingMode: (enabled: boolean) => void;
  enableProgressTracking: (sessionName?: string) => void;
  disableProgressTracking: () => void;
}

const defaultSopDocument: SopDocument = {
  title: "",
  topic: "",
  date: new Date().toISOString().split("T")[0],
  description: "", // Added description
  logo: null,
  backgroundImage: null,
  steps: [],
  companyName: "Company Name",
  tableOfContents: true,
  darkMode: false,
  trainingMode: true,
  progressTracking: {
    enabled: false
  }
};

export const SopContext = createContext<SopContextType>({} as SopContextType);

export const SopProvider = ({ children }: { children: ReactNode }) => {
  const [sopDocument, setSopDocument] = useState<SopDocument>(() => {
    const savedDocument = StorageManager.loadDocument();
    if (savedDocument) {
      try {
        return { ...defaultSopDocument, ...savedDocument };
      } catch (error) {
        console.error("Failed to load saved document:", error);
        toast({
          title: "Warning",
          description: "Failed to load saved document. Starting fresh.",
          variant: "destructive"
        });
      }
    }
    return defaultSopDocument;
  });

  React.useEffect(() => {
    // TEMPORARILY DISABLED: Auto-save causing infinite loop
    // TODO: Fix StorageManager.clearOldData() to not clear auth tokens
    /*
    const saveSuccess = StorageManager.saveDocument(sopDocument);
    
    if (!saveSuccess) {
      toast({
        title: "Storage Warning",
        description: "Document is too large for auto-save. Consider exporting to file.",
        variant: "destructive"
      });
    }
    */
  }, [sopDocument]);

  // Document operations
  const setSopTitle = (title: string) => {
    setSopDocument(prev => DocumentManager.updateTitle(prev, title));
  };

  const setSopTopic = (topic: string) => {
    setSopDocument(prev => DocumentManager.updateTopic(prev, topic));
  };

  const setSopDate = (date: string) => {
    setSopDocument(prev => DocumentManager.updateDate(prev, date));
  };

  const setSopDescription = (description: string) => {
    setSopDocument(prev => ({ ...prev, description }));
  };

  const setLogo = (logo: string | null) => {
    setSopDocument(prev => DocumentManager.updateLogo(prev, logo));
  };
  
  const setBackgroundImage = (image: string | null) => {
    setSopDocument(prev => DocumentManager.updateBackgroundImage(prev, image));
  };

  const setCompanyName = (companyName: string) => {
    setSopDocument(prev => DocumentManager.updateCompanyName(prev, companyName));
  };

  const setTableOfContents = (enabled: boolean) => {
    setSopDocument(prev => DocumentManager.updateTableOfContents(prev, enabled));
  };

  const setDarkMode = (enabled: boolean) => {
    setSopDocument(prev => DocumentManager.updateDarkMode(prev, enabled));
  };

  const setTrainingMode = (enabled: boolean) => {
    setSopDocument(prev => DocumentManager.updateTrainingMode(prev, enabled));
  };

  const enableProgressTracking = (sessionName?: string) => {
    setSopDocument(prev => DocumentManager.enableProgressTracking(prev, sessionName));
  };

  const disableProgressTracking = () => {
    setSopDocument(prev => DocumentManager.disableProgressTracking(prev));
  };

  // Step operations
  const addStep = () => {
    setSopDocument(prev => StepManager.addStep(prev));
  };

  const addStepFromTemplate = (templateType: "standard" | "knowledge-check" | "scenario" | "resource-focus") => {
    setSopDocument(prev => StepManager.addStepFromTemplate(prev, templateType));
  };

  const updateStep = (stepId: string, field: keyof SopStep, value: any) => {
    setSopDocument(prev => StepManager.updateStep(prev, stepId, field, value));
  };

  const moveStepUp = (stepId: string) => {
    setSopDocument(prev => StepManager.moveStepUp(prev, stepId));
  };

  const moveStepDown = (stepId: string) => {
    setSopDocument(prev => StepManager.moveStepDown(prev, stepId));
  };

  const deleteStep = (stepId: string) => {
    setSopDocument(prev => StepManager.deleteStep(prev, stepId));
  };

  const duplicateStep = (stepId: string) => {
    setSopDocument(prev => StepManager.duplicateStep(prev, stepId));
  };

  const toggleStepCompletion = (stepId: string) => {
    setSopDocument(prev => StepManager.toggleStepCompletion(prev, stepId));
  };

  const addStepTag = (stepId: string, tag: string) => {
    setSopDocument(prev => StepManager.addStepTag(prev, stepId, tag));
  };

  const removeStepTag = (stepId: string, tag: string) => {
    setSopDocument(prev => StepManager.removeStepTag(prev, stepId, tag));
  };

  const addStepResource = (stepId: string, resource: StepResource) => {
    setSopDocument(prev => StepManager.addStepResource(prev, stepId, resource));
  };

  const removeStepResource = (stepId: string, resourceId: string) => {
    setSopDocument(prev => StepManager.removeStepResource(prev, stepId, resourceId));
  };

  const updateStepResource = (stepId: string, resourceId: string, updates: Partial<StepResource>) => {
    setSopDocument(prev => StepManager.updateStepResource(prev, stepId, resourceId, updates));
  };

  // Screenshot operations
  const setStepScreenshot = (stepId: string, dataUrl: string) => {
    setSopDocument(prev => ScreenshotManager.setStepScreenshot(prev, stepId, dataUrl));
  };

  const setStepSecondaryScreenshot = (stepId: string, dataUrl: string) => {
    setSopDocument(prev => ScreenshotManager.setStepSecondaryScreenshot(prev, stepId, dataUrl));
  };

  const cropStepScreenshot = (stepId: string, croppedDataUrl: string) => {
    // Use the first screenshot ID for backward compatibility
    const step = sopDocument.steps.find(s => s.id === stepId);
    const screenshotId = step?.screenshot?.id || step?.screenshots?.[0]?.id;
    if (screenshotId) {
      setSopDocument(prev => ScreenshotManager.cropStepScreenshot(prev, stepId, screenshotId, croppedDataUrl));
    }
  };

  const undoCropStepScreenshot = (stepId: string) => {
    // Use the first screenshot ID for backward compatibility
    const step = sopDocument.steps.find(s => s.id === stepId);
    const screenshotId = step?.screenshot?.id || step?.screenshots?.[0]?.id;
    if (screenshotId) {
      setSopDocument(prev => ScreenshotManager.undoCropStepScreenshot(prev, stepId, screenshotId));
    }
  };

  // Multiple screenshots management
  const addStepScreenshot = (stepId: string, dataUrl: string, title?: string, description?: string) => {
    setSopDocument(prev => ScreenshotManager.addStepScreenshot(prev, stepId, dataUrl, title, description));
  };

  const updateStepScreenshot = (stepId: string, screenshotId: string, updates: Partial<any>) => {
    setSopDocument(prev => ScreenshotManager.updateStepScreenshot(prev, stepId, screenshotId, updates));
  };

  const deleteStepScreenshot = (stepId: string, screenshotId: string) => {
    setSopDocument(prev => ScreenshotManager.deleteStepScreenshot(prev, stepId, screenshotId));
  };

  const reorderStepScreenshots = (stepId: string, fromIndex: number, toIndex: number) => {
    setSopDocument(prev => ScreenshotManager.reorderStepScreenshots(prev, stepId, fromIndex, toIndex));
  };

  const cropSpecificScreenshot = (stepId: string, screenshotId: string, croppedDataUrl: string) => {
    setSopDocument(prev => ScreenshotManager.cropStepScreenshot(prev, stepId, screenshotId, croppedDataUrl));
  };

  const undoCropSpecificScreenshot = (stepId: string, screenshotId: string) => {
    setSopDocument(prev => ScreenshotManager.undoCropStepScreenshot(prev, stepId, screenshotId));
  };

  const addCallout = (stepId: string, callout: Omit<Callout, "id">) => {
    setSopDocument(prev => ScreenshotManager.addCallout(prev, stepId, callout));
  };

  const updateCallout = (stepId: string, callout: Callout) => {
    setSopDocument(prev => ScreenshotManager.updateCallout(prev, stepId, callout));
  };

  const deleteCallout = (stepId: string, calloutId: string) => {
    setSopDocument(prev => ScreenshotManager.deleteCallout(prev, stepId, calloutId));
  };

  const addSecondaryCallout = (stepId: string, callout: Omit<Callout, "id">) => {
    setSopDocument(prev => ScreenshotManager.addSecondaryCallout(prev, stepId, callout));
  };

  const updateSecondaryCallout = (stepId: string, callout: Callout) => {
    setSopDocument(prev => ScreenshotManager.updateSecondaryCallout(prev, stepId, callout));
  };

  const deleteSecondaryCallout = (stepId: string, calloutId: string) => {
    setSopDocument(prev => ScreenshotManager.deleteSecondaryCallout(prev, stepId, calloutId));
  };

  // Document management
  const saveDocumentToJSON = () => {
    DocumentManager.saveToJSON(sopDocument);
  };

  const loadDocumentFromJSON = (jsonData: string) => {
    const loadedDocument = DocumentManager.loadFromJSON(jsonData, defaultSopDocument);
    setSopDocument(loadedDocument);
  };

  const resetDocument = () => {
    setSopDocument(defaultSopDocument);
    localStorage.removeItem("sop-document-draft");
    toast({
      title: "Document Reset",
      description: "Your SOP document has been reset"
    });
  };

  const exportDocument = async (format: ExportFormat, options?: any): Promise<void> => {
    return DocumentManager.exportDocument(sopDocument, format, options);
  };
  
  const getPdfPreview = async (): Promise<string> => {
    return DocumentManager.getPdfPreview(sopDocument);
  };

  const getCompletedStepsCount = (): number => {
    return DocumentManager.getProgressInfo(sopDocument).completed;
  };

  const getProgressPercentage = (): number => {
    return DocumentManager.getProgressInfo(sopDocument).percentage;
  };

  const contextValue: SopContextType = {
    sopDocument,
    setSopTitle,
    setSopTopic,
    setSopDate,
    setSopDescription,
    setLogo,
    setBackgroundImage,
    setCompanyName,
    
    // Step management
    addStep,
    addStepFromTemplate,
    updateStep,
    moveStepUp,
    moveStepDown,
    deleteStep,
    duplicateStep,
    toggleStepCompletion,
    
    // Screenshot management
    setStepScreenshot,
    setStepSecondaryScreenshot,
    cropStepScreenshot,
    undoCropStepScreenshot,
    
    // Multiple screenshots management
    addStepScreenshot,
    updateStepScreenshot,
    deleteStepScreenshot,
    reorderStepScreenshots,
    cropSpecificScreenshot,
    undoCropSpecificScreenshot,
    
    // Callout management
    addCallout,
    updateCallout,
    deleteCallout,
    addSecondaryCallout,
    updateSecondaryCallout,
    deleteSecondaryCallout,
    
    // Tags and resources
    addStepTag,
    removeStepTag,
    addStepResource,
    removeStepResource,
    updateStepResource,
    
    // Document management
    saveDocumentToJSON,
    loadDocumentFromJSON,
    resetDocument,
    
    // Export functionality
    exportDocument,
    getPdfPreview,
    
    // Progress tracking
    getCompletedStepsCount,
    getProgressPercentage,
    
    // Settings
    setTableOfContents,
    setDarkMode,
    setTrainingMode,
    enableProgressTracking,
    disableProgressTracking
  };

  return (
    <SopContext.Provider value={contextValue}>
      {children}
    </SopContext.Provider>
  );
};

export const useSopContext = () => useContext(SopContext);
