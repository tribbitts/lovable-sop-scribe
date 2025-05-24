
import React, { createContext, useState, useContext, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { SopDocument, SopStep, ScreenshotData, Callout, StepResource, ExportFormat, ExportOptions } from "../types/sop";
import { saveAs } from "file-saver";
import { toast } from "@/hooks/use-toast";
import { HtmlExportOptions } from "@/lib/html-export";

interface SopContextType {
  sopDocument: SopDocument;
  setSopTitle: (title: string) => void;
  setSopTopic: (topic: string) => void;
  setSopDate: (date: string) => void;
  setLogo: (logo: string | null) => void;
  setBackgroundImage: (image: string | null) => void;
  setCompanyName: (name: string) => void;
  
  // Step management
  addStep: () => void;
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
  enableProgressTracking: (sessionName?: string) => void;
  disableProgressTracking: () => void;
}

const defaultSopDocument: SopDocument = {
  title: "",
  topic: "",
  date: new Date().toISOString().split("T")[0],
  logo: null,
  backgroundImage: null,
  steps: [],
  companyName: "Company Name",
  tableOfContents: true,
  darkMode: false,
  progressTracking: {
    enabled: false
  }
};

export const SopContext = createContext<SopContextType>({} as SopContextType);

export const SopProvider = ({ children }: { children: ReactNode }) => {
  const [sopDocument, setSopDocument] = useState<SopDocument>(() => {
    // Try to load from localStorage on initial load
    const saved = localStorage.getItem("sop-document-draft");
    if (saved) {
      try {
        return { ...defaultSopDocument, ...JSON.parse(saved) };
      } catch (error) {
        console.error("Failed to load saved document:", error);
      }
    }
    return defaultSopDocument;
  });

  // Auto-save to localStorage whenever document changes
  React.useEffect(() => {
    localStorage.setItem("sop-document-draft", JSON.stringify(sopDocument));
  }, [sopDocument]);

  const setSopTitle = (title: string) => {
    setSopDocument((prev) => ({ ...prev, title }));
  };

  const setSopTopic = (topic: string) => {
    setSopDocument((prev) => ({ ...prev, topic }));
  };

  const setSopDate = (date: string) => {
    setSopDocument((prev) => ({ ...prev, date }));
  };

  const setLogo = (logo: string | null) => {
    setSopDocument((prev) => ({ ...prev, logo }));
  };
  
  const setBackgroundImage = (image: string | null) => {
    setSopDocument((prev) => ({ ...prev, backgroundImage: image }));
  };

  const setCompanyName = (companyName: string) => {
    setSopDocument((prev) => ({ ...prev, companyName }));
  };

  const addStep = () => {
    const newStep: SopStep = {
      id: uuidv4(),
      title: "",
      description: "",
      detailedInstructions: "",
      notes: "",
      tags: [],
      resources: [],
      screenshot: null,
      completed: false
    };

    setSopDocument((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const updateStep = (stepId: string, field: keyof SopStep, value: any) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step
      ),
    }));
  };

  const moveStepUp = (stepId: string) => {
    setSopDocument((prev) => {
      const stepIndex = prev.steps.findIndex((step) => step.id === stepId);
      if (stepIndex <= 0) return prev;

      const newSteps = [...prev.steps];
      const temp = newSteps[stepIndex];
      newSteps[stepIndex] = newSteps[stepIndex - 1];
      newSteps[stepIndex - 1] = temp;

      return { ...prev, steps: newSteps };
    });
  };

  const moveStepDown = (stepId: string) => {
    setSopDocument((prev) => {
      const stepIndex = prev.steps.findIndex((step) => step.id === stepId);
      if (stepIndex === -1 || stepIndex >= prev.steps.length - 1) return prev;

      const newSteps = [...prev.steps];
      const temp = newSteps[stepIndex];
      newSteps[stepIndex] = newSteps[stepIndex + 1];
      newSteps[stepIndex + 1] = temp;

      return { ...prev, steps: newSteps };
    });
  };

  const deleteStep = (stepId: string) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== stepId),
    }));
  };

  const duplicateStep = (stepId: string) => {
    setSopDocument((prev) => {
      const stepIndex = prev.steps.findIndex((step) => step.id === stepId);
      if (stepIndex === -1) return prev;

      const originalStep = prev.steps[stepIndex];
      const duplicatedStep: SopStep = {
        ...originalStep,
        id: uuidv4(),
        title: originalStep.title ? `${originalStep.title} (Copy)` : "",
        completed: false,
        screenshot: originalStep.screenshot ? {
          ...originalStep.screenshot,
          id: uuidv4(),
          callouts: originalStep.screenshot.callouts.map(callout => ({
            ...callout,
            id: uuidv4()
          })),
          secondaryCallouts: originalStep.screenshot.secondaryCallouts?.map(callout => ({
            ...callout,
            id: uuidv4()
          }))
        } : null,
        resources: originalStep.resources?.map(resource => ({
          ...resource,
          id: uuidv4()
        }))
      };

      const newSteps = [...prev.steps];
      newSteps.splice(stepIndex + 1, 0, duplicatedStep);

      return { ...prev, steps: newSteps };
    });
  };

  const toggleStepCompletion = (stepId: string) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      ),
    }));
  };

  
  const setStepScreenshot = (stepId: string, dataUrl: string) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            screenshot: {
              id: uuidv4(),
              dataUrl,
              originalDataUrl: dataUrl,
              callouts: step.screenshot?.callouts || [],
              secondaryDataUrl: step.screenshot?.secondaryDataUrl,
              secondaryCallouts: step.screenshot?.secondaryCallouts || [],
              isCropped: false
            },
          };
        }
        return step;
      }),
    }));
  };
  
  const setStepSecondaryScreenshot = (stepId: string, dataUrl: string) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            screenshot: {
              id: step.screenshot?.id || uuidv4(),
              dataUrl: step.screenshot?.dataUrl || '',
              originalDataUrl: step.screenshot?.originalDataUrl,
              callouts: step.screenshot?.callouts || [],
              secondaryDataUrl: dataUrl,
              secondaryCallouts: step.screenshot?.secondaryCallouts || [],
              isCropped: step.screenshot?.isCropped || false
            },
          };
        }
        return step;
      }),
    }));
  };

  const cropStepScreenshot = (stepId: string, croppedDataUrl: string) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId && step.screenshot) {
          return {
            ...step,
            screenshot: {
              ...step.screenshot,
              dataUrl: croppedDataUrl,
              isCropped: true
            },
          };
        }
        return step;
      }),
    }));
  };

  const undoCropStepScreenshot = (stepId: string) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId && step.screenshot?.originalDataUrl) {
          return {
            ...step,
            screenshot: {
              ...step.screenshot,
              dataUrl: step.screenshot.originalDataUrl,
              isCropped: false
            },
          };
        }
        return step;
      }),
    }));
  };

  const addCallout = (stepId: string, callout: Omit<Callout, "id">) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId && step.screenshot) {
          return {
            ...step,
            screenshot: {
              ...step.screenshot,
              callouts: [
                ...step.screenshot.callouts,
                { ...callout, id: uuidv4() },
              ],
            },
          };
        }
        return step;
      }),
    }));
  };

  const updateCallout = (stepId: string, callout: Callout) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId && step.screenshot) {
          return {
            ...step,
            screenshot: {
              ...step.screenshot,
              callouts: step.screenshot.callouts.map((c) =>
                c.id === callout.id ? callout : c
              ),
            },
          };
        }
        return step;
      }),
    }));
  };

  const deleteCallout = (stepId: string, calloutId: string) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId && step.screenshot) {
          return {
            ...step,
            screenshot: {
              ...step.screenshot,
              callouts: step.screenshot.callouts.filter((c) => c.id !== calloutId),
            },
          };
        }
        return step;
      }),
    }));
  };

  const addSecondaryCallout = (stepId: string, callout: Omit<Callout, "id">) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId && step.screenshot) {
          return {
            ...step,
            screenshot: {
              ...step.screenshot,
              secondaryCallouts: [
                ...(step.screenshot.secondaryCallouts || []),
                { ...callout, id: uuidv4() },
              ],
            },
          };
        }
        return step;
      }),
    }));
  };

  const updateSecondaryCallout = (stepId: string, callout: Callout) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId && step.screenshot) {
          return {
            ...step,
            screenshot: {
              ...step.screenshot,
              secondaryCallouts: (step.screenshot.secondaryCallouts || []).map((c) =>
                c.id === callout.id ? callout : c
              ),
            },
          };
        }
        return step;
      }),
    }));
  };

  const deleteSecondaryCallout = (stepId: string, calloutId: string) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId && step.screenshot) {
          return {
            ...step,
            screenshot: {
              ...step.screenshot,
              secondaryCallouts: (step.screenshot.secondaryCallouts || []).filter(
                (c) => c.id !== calloutId
              ),
            },
          };
        }
        return step;
      }),
    }));
  };

  const addStepTag = (stepId: string, tag: string) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId) {
          const currentTags = step.tags || [];
          if (!currentTags.includes(tag)) {
            return { ...step, tags: [...currentTags, tag] };
          }
        }
        return step;
      }),
    }));
  };

  const removeStepTag = (stepId: string, tag: string) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId) {
          const currentTags = step.tags || [];
          return { ...step, tags: currentTags.filter(t => t !== tag) };
        }
        return step;
      }),
    }));
  };

  const addStepResource = (stepId: string, resource: StepResource) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId) {
          const currentResources = step.resources || [];
          return { ...step, resources: [...currentResources, resource] };
        }
        return step;
      }),
    }));
  };

  const removeStepResource = (stepId: string, resourceId: string) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId) {
          const currentResources = step.resources || [];
          return { ...step, resources: currentResources.filter(r => r.id !== resourceId) };
        }
        return step;
      }),
    }));
  };

  const updateStepResource = (stepId: string, resourceId: string, updates: Partial<StepResource>) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId) {
          const currentResources = step.resources || [];
          return {
            ...step,
            resources: currentResources.map(r =>
              r.id === resourceId ? { ...r, ...updates } : r
            )
          };
        }
        return step;
      }),
    }));
  };

  const saveDocumentToJSON = () => {
    try {
      const jsonData = JSON.stringify(sopDocument, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const fileName = `${sopDocument.title || "SOP"}_${new Date().toISOString().split("T")[0]}.json`;
      saveAs(blob, fileName);
      
      toast({
        title: "SOP Saved",
        description: "Your SOP has been saved as JSON file"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SOP document",
        variant: "destructive"
      });
    }
  };

  const loadDocumentFromJSON = (jsonData: string) => {
    try {
      const parsedData = JSON.parse(jsonData) as SopDocument;
      // Ensure the document has all required fields
      setSopDocument({ ...defaultSopDocument, ...parsedData });
      
      toast({
        title: "SOP Loaded",
        description: "Your SOP has been loaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load SOP document",
        variant: "destructive"
      });
    }
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
    try {
      if (format === "pdf") {
        // Use existing PDF export functionality
        const { generatePDF } = await import("@/lib/pdf-generator");
        await generatePDF(sopDocument);
      } else if (format === "html" || format === "training-module") {
        // Use existing HTML export functionality
        const { exportSopAsHtml } = await import("@/lib/html-export");
        
        // Convert ExportOptions to HtmlExportOptions with enhanced support
        const htmlOptions: any = {
          mode: options?.mode || 'standalone',
          quality: 0.85,
          includeTableOfContents: options?.includeTableOfContents,
          enhanced: options?.enhanced || false,
          enhancedOptions: options?.enhancedOptions
        };
        
        console.log('🚀 Exporting with options:', htmlOptions);
        
        await exportSopAsHtml(sopDocument, htmlOptions);
      }
      
      const exportType = format === "training-module" ? "Training Module" : format.toUpperCase();
      toast({
        title: "Export Successful",
        description: `Your SOP has been exported as ${exportType}`
      });
    } catch (error) {
      console.error("Export error:", error);
      const exportType = format === "training-module" ? "Training Module" : format.toUpperCase();
      toast({
        title: "Export Failed",
        description: `Failed to export SOP as ${exportType}`,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const getPdfPreview = async (): Promise<string> => {
    try {
      const { generatePDF } = await import("@/lib/pdf-generator");
      return await generatePDF(sopDocument);
    } catch (error) {
      console.error("PDF preview error:", error);
      throw error;
    }
  };

  const getCompletedStepsCount = (): number => {
    return sopDocument.steps.filter(step => step.completed).length;
  };

  const getProgressPercentage = (): number => {
    if (sopDocument.steps.length === 0) return 0;
    return Math.round((getCompletedStepsCount() / sopDocument.steps.length) * 100);
  };

  const setTableOfContents = (enabled: boolean) => {
    setSopDocument((prev) => ({ ...prev, tableOfContents: enabled }));
  };

  const setDarkMode = (enabled: boolean) => {
    setSopDocument((prev) => ({ ...prev, darkMode: enabled }));
  };

  const enableProgressTracking = (sessionName?: string) => {
    setSopDocument((prev) => ({
      ...prev,
      progressTracking: {
        enabled: true,
        sessionName,
        lastSaved: new Date().toISOString()
      }
    }));
  };

  const disableProgressTracking = () => {
    setSopDocument((prev) => ({
      ...prev,
      progressTracking: {
        enabled: false
      }
    }));
  };

  const contextValue: SopContextType = {
    sopDocument,
    setSopTitle,
    setSopTopic,
    setSopDate,
    setLogo,
    setBackgroundImage,
    setCompanyName,
    
    // Step management
    addStep,
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
