import React, { createContext, useContext, ReactNode } from "react";
import { SopStep, Callout, StepResource } from "../types/sop";
import { EnhancedContentBlock } from "../types/enhanced-content";
import { useDocumentContext } from "./DocumentContext";
import { StepManager } from "./managers/StepManager";
import { ScreenshotManager } from "./managers/ScreenshotManager";

interface StepContextType {
  // Step management
  addStep: () => void;
  addStepFromTemplate: (templateType: "standard" | "knowledge-check" | "scenario" | "resource-focus") => void;
  updateStep: (stepId: string, field: keyof SopStep, value: any) => void;
  moveStepUp: (stepId: string) => void;
  moveStepDown: (stepId: string) => void;
  deleteStep: (stepId: string) => void;
  duplicateStep: (stepId: string) => void;
  toggleStepCompletion: (stepId: string) => void;
  
  // Enhanced content blocks
  addStepContentBlock: (stepId: string, block: EnhancedContentBlock) => void;
  updateStepContentBlock: (stepId: string, blockId: string, updates: Partial<EnhancedContentBlock>) => void;
  removeStepContentBlock: (stepId: string, blockId: string) => void;
  reorderStepContentBlocks: (stepId: string, fromIndex: number, toIndex: number) => void;
  
  // Screenshot management (legacy support)
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
}

export const StepContext = createContext<StepContextType>({} as StepContextType);

/**
 * Specialized context for step-level operations
 * Handles all step management, content blocks, screenshots, and callouts
 */
export const StepProvider = ({ children }: { children: ReactNode }) => {
  const { sopDocument, updateDocument } = useDocumentContext();

  // Step management
  const addStep = () => {
    updateDocument(prev => StepManager.addStep(prev));
  };

  const addStepFromTemplate = (templateType: "standard" | "knowledge-check" | "scenario" | "resource-focus") => {
    updateDocument(prev => StepManager.addStepFromTemplate(prev, templateType));
  };

  const updateStep = (stepId: string, field: keyof SopStep, value: any) => {
    updateDocument(prev => StepManager.updateStep(prev, stepId, field, value));
  };

  const moveStepUp = (stepId: string) => {
    updateDocument(prev => StepManager.moveStepUp(prev, stepId));
  };

  const moveStepDown = (stepId: string) => {
    updateDocument(prev => StepManager.moveStepDown(prev, stepId));
  };

  const deleteStep = (stepId: string) => {
    updateDocument(prev => StepManager.deleteStep(prev, stepId));
  };

  const duplicateStep = (stepId: string) => {
    updateDocument(prev => StepManager.duplicateStep(prev, stepId));
  };

  const toggleStepCompletion = (stepId: string) => {
    updateDocument(prev => StepManager.toggleStepCompletion(prev, stepId));
  };

  // Enhanced content blocks
  const addStepContentBlock = (stepId: string, block: EnhancedContentBlock) => {
    updateDocument(prev => {
      const stepIndex = prev.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return prev;

      const updatedSteps = [...prev.steps];
      const step = updatedSteps[stepIndex];
      const currentBlocks = step.enhancedContentBlocks || [];
      const newBlock = { ...block, order: currentBlocks.length };
      
      updatedSteps[stepIndex] = {
        ...step,
        enhancedContentBlocks: [...currentBlocks, newBlock]
      };

      return { ...prev, steps: updatedSteps };
    });
  };

  const updateStepContentBlock = (stepId: string, blockId: string, updates: Partial<EnhancedContentBlock>) => {
    updateDocument(prev => {
      const stepIndex = prev.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return prev;

      const updatedSteps = [...prev.steps];
      const step = updatedSteps[stepIndex];
      const blocks = step.enhancedContentBlocks || [];
      
      const updatedBlocks = blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      );

      updatedSteps[stepIndex] = {
        ...step,
        enhancedContentBlocks: updatedBlocks
      };

      return { ...prev, steps: updatedSteps };
    });
  };

  const removeStepContentBlock = (stepId: string, blockId: string) => {
    updateDocument(prev => {
      const stepIndex = prev.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return prev;

      const updatedSteps = [...prev.steps];
      const step = updatedSteps[stepIndex];
      const blocks = step.enhancedContentBlocks || [];
      
      const updatedBlocks = blocks.filter(block => block.id !== blockId);

      updatedSteps[stepIndex] = {
        ...step,
        enhancedContentBlocks: updatedBlocks
      };

      return { ...prev, steps: updatedSteps };
    });
  };

  const reorderStepContentBlocks = (stepId: string, fromIndex: number, toIndex: number) => {
    updateDocument(prev => {
      const stepIndex = prev.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return prev;

      const updatedSteps = [...prev.steps];
      const step = updatedSteps[stepIndex];
      const blocks = [...(step.enhancedContentBlocks || [])];
      
      const [movedBlock] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, movedBlock);
      
      // Update order property
      const reorderedBlocks = blocks.map((block, index) => ({
        ...block,
        order: index
      }));

      updatedSteps[stepIndex] = {
        ...step,
        enhancedContentBlocks: reorderedBlocks
      };

      return { ...prev, steps: updatedSteps };
    });
  };

  // Screenshot management (legacy support)
  const setStepScreenshot = (stepId: string, dataUrl: string) => {
    updateDocument(prev => ScreenshotManager.setStepScreenshot(prev, stepId, dataUrl));
  };

  const setStepSecondaryScreenshot = (stepId: string, dataUrl: string) => {
    updateDocument(prev => ScreenshotManager.setStepSecondaryScreenshot(prev, stepId, dataUrl));
  };

  const cropStepScreenshot = (stepId: string, croppedDataUrl: string) => {
    updateDocument(prev => ScreenshotManager.cropStepScreenshot(prev, stepId, "", croppedDataUrl));
  };

  const undoCropStepScreenshot = (stepId: string) => {
    updateDocument(prev => ScreenshotManager.undoCropStepScreenshot(prev, stepId, ""));
  };

  // Multiple screenshots management
  const addStepScreenshot = (stepId: string, dataUrl: string, title?: string, description?: string) => {
    updateDocument(prev => ScreenshotManager.addStepScreenshot(prev, stepId, dataUrl, title, description));
  };

  const updateStepScreenshot = (stepId: string, screenshotId: string, updates: Partial<any>) => {
    updateDocument(prev => ScreenshotManager.updateStepScreenshot(prev, stepId, screenshotId, updates));
  };

  const deleteStepScreenshot = (stepId: string, screenshotId: string) => {
    updateDocument(prev => ScreenshotManager.deleteStepScreenshot(prev, stepId, screenshotId));
  };

  const reorderStepScreenshots = (stepId: string, fromIndex: number, toIndex: number) => {
    updateDocument(prev => ScreenshotManager.reorderStepScreenshots(prev, stepId, fromIndex, toIndex));
  };

  const cropSpecificScreenshot = (stepId: string, screenshotId: string, croppedDataUrl: string) => {
    updateDocument(prev => ScreenshotManager.cropStepScreenshot(prev, stepId, screenshotId, croppedDataUrl));
  };

  const undoCropSpecificScreenshot = (stepId: string, screenshotId: string) => {
    updateDocument(prev => ScreenshotManager.undoCropStepScreenshot(prev, stepId, screenshotId));
  };

  // Callout management
  const addCallout = (stepId: string, callout: Omit<Callout, "id">) => {
    updateDocument(prev => ScreenshotManager.addCallout(prev, stepId, callout));
  };

  const updateCallout = (stepId: string, callout: Callout) => {
    updateDocument(prev => ScreenshotManager.updateCallout(prev, stepId, callout));
  };

  const deleteCallout = (stepId: string, calloutId: string) => {
    updateDocument(prev => ScreenshotManager.deleteCallout(prev, stepId, calloutId));
  };

  const addSecondaryCallout = (stepId: string, callout: Omit<Callout, "id">) => {
    updateDocument(prev => ScreenshotManager.addSecondaryCallout(prev, stepId, callout));
  };

  const updateSecondaryCallout = (stepId: string, callout: Callout) => {
    updateDocument(prev => ScreenshotManager.updateSecondaryCallout(prev, stepId, callout));
  };

  const deleteSecondaryCallout = (stepId: string, calloutId: string) => {
    updateDocument(prev => ScreenshotManager.deleteSecondaryCallout(prev, stepId, calloutId));
  };

  // Tags and resources
  const addStepTag = (stepId: string, tag: string) => {
    updateDocument(prev => StepManager.addStepTag(prev, stepId, tag));
  };

  const removeStepTag = (stepId: string, tag: string) => {
    updateDocument(prev => StepManager.removeStepTag(prev, stepId, tag));
  };

  const addStepResource = (stepId: string, resource: StepResource) => {
    updateDocument(prev => StepManager.addStepResource(prev, stepId, resource));
  };

  const removeStepResource = (stepId: string, resourceId: string) => {
    updateDocument(prev => StepManager.removeStepResource(prev, stepId, resourceId));
  };

  const updateStepResource = (stepId: string, resourceId: string, updates: Partial<StepResource>) => {
    updateDocument(prev => StepManager.updateStepResource(prev, stepId, resourceId, updates));
  };

  const contextValue: StepContextType = {
    addStep,
    addStepFromTemplate,
    updateStep,
    moveStepUp,
    moveStepDown,
    deleteStep,
    duplicateStep,
    toggleStepCompletion,
    addStepContentBlock,
    updateStepContentBlock,
    removeStepContentBlock,
    reorderStepContentBlocks,
    setStepScreenshot,
    setStepSecondaryScreenshot,
    cropStepScreenshot,
    undoCropStepScreenshot,
    addStepScreenshot,
    updateStepScreenshot,
    deleteStepScreenshot,
    reorderStepScreenshots,
    cropSpecificScreenshot,
    undoCropSpecificScreenshot,
    addCallout,
    updateCallout,
    deleteCallout,
    addSecondaryCallout,
    updateSecondaryCallout,
    deleteSecondaryCallout,
    addStepTag,
    removeStepTag,
    addStepResource,
    removeStepResource,
    updateStepResource
  };

  return (
    <StepContext.Provider value={contextValue}>
      {children}
    </StepContext.Provider>
  );
};

export const useStepContext = () => {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error("useStepContext must be used within a StepProvider");
  }
  return context;
}; 