
import React, { createContext, useState, useContext, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { SopDocument, SopStep, ScreenshotData, Callout } from "../types/sop";
import { saveAs } from "file-saver";
import { toast } from "@/hooks/use-toast";

interface SopContextType {
  sopDocument: SopDocument;
  setSopTitle: (title: string) => void;
  setSopTopic: (topic: string) => void;
  setSopDate: (date: string) => void;
  setLogo: (logo: string | null) => void;
  setBackgroundImage: (image: string | null) => void;
  setCompanyName: (name: string) => void;
  addStep: () => void;
  updateStep: (stepId: string, field: string, value: string) => void;
  moveStepUp: (stepId: string) => void;
  moveStepDown: (stepId: string) => void;
  deleteStep: (stepId: string) => void;
  setStepScreenshot: (stepId: string, dataUrl: string) => void;
  setStepSecondaryScreenshot: (stepId: string, dataUrl: string) => void;
  addCallout: (stepId: string, callout: Omit<Callout, "id">) => void;
  updateCallout: (stepId: string, callout: Callout) => void;
  deleteCallout: (stepId: string, calloutId: string) => void;
  addSecondaryCallout: (stepId: string, callout: Omit<Callout, "id">) => void;
  updateSecondaryCallout: (stepId: string, callout: Callout) => void;
  deleteSecondaryCallout: (stepId: string, calloutId: string) => void;
  saveDocumentToJSON: () => void;
  loadDocumentFromJSON: (jsonData: string) => void;
  resetDocument: () => void;
  getPdfPreview: () => Promise<string>;
}

const defaultSopDocument: SopDocument = {
  title: "",
  topic: "",
  date: new Date().toISOString().split("T")[0],
  logo: null,
  backgroundImage: null,
  steps: [],
  companyName: "Company Name"
};

export const SopContext = createContext<SopContextType>({} as SopContextType);

export const SopProvider = ({ children }: { children: ReactNode }) => {
  const [sopDocument, setSopDocument] = useState<SopDocument>(() => {
    return defaultSopDocument;
  });

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
      description: "",
      screenshot: null,
    };

    setSopDocument((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const updateStep = (stepId: string, field: string, value: string) => {
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
              callouts: step.screenshot?.callouts || [],
              secondaryDataUrl: step.screenshot?.secondaryDataUrl,
              secondaryCallouts: step.screenshot?.secondaryCallouts || [],
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
              callouts: step.screenshot?.callouts || [],
              secondaryDataUrl: dataUrl,
              secondaryCallouts: step.screenshot?.secondaryCallouts || [],
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
  
  // Secondary screenshot callout functions
  const addSecondaryCallout = (stepId: string, callout: Omit<Callout, "id">) => {
    setSopDocument((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => {
        if (step.id === stepId && step.screenshot && step.screenshot.secondaryDataUrl) {
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
        if (step.id === stepId && step.screenshot && step.screenshot.secondaryCallouts) {
          return {
            ...step,
            screenshot: {
              ...step.screenshot,
              secondaryCallouts: step.screenshot.secondaryCallouts.map((c) =>
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
        if (step.id === stepId && step.screenshot && step.screenshot.secondaryCallouts) {
          return {
            ...step,
            screenshot: {
              ...step.screenshot,
              secondaryCallouts: step.screenshot.secondaryCallouts.filter((c) => c.id !== calloutId),
            },
          };
        }
        return step;
      }),
    }));
  };

  const saveDocumentToJSON = () => {
    try {
      const jsonData = JSON.stringify(sopDocument);
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
      setSopDocument(parsedData);
      
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
  };
  
  // Import generatePDF from the correct location
  const getPdfPreview = async (): Promise<string> => {
    // This function will be implemented later
    // For now it's a placeholder that returns an empty string
    return '';
  };

  return (
    <SopContext.Provider
      value={{
        sopDocument,
        setSopTitle,
        setSopTopic,
        setSopDate,
        setLogo,
        setBackgroundImage,
        setCompanyName,
        addStep,
        updateStep,
        moveStepUp,
        moveStepDown,
        deleteStep,
        setStepScreenshot,
        setStepSecondaryScreenshot,
        addCallout,
        updateCallout,
        deleteCallout,
        addSecondaryCallout,
        updateSecondaryCallout,
        deleteSecondaryCallout,
        saveDocumentToJSON,
        loadDocumentFromJSON,
        resetDocument,
        getPdfPreview
      }}
    >
      {children}
    </SopContext.Provider>
  );
};

export const useSopContext = () => useContext(SopContext);
