import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ScreenshotData, SopStep } from '@/types/sop';
import { useFileUpload } from './useFileUpload';

export interface ScreenshotManagerOptions {
  stepId: string;
  step: SopStep;
  onStepChange?: (stepId: string, field: keyof SopStep, value: any) => void;
}

/**
 * Unified screenshot management hook
 * Consolidates all screenshot operations and eliminates legacy/new system complexity
 */
export const useScreenshotManager = ({ stepId, step, onStepChange }: ScreenshotManagerOptions) => {
  
  // Get all screenshots (unified approach)
  const getAllScreenshots = useCallback((): ScreenshotData[] => {
    const screenshots: ScreenshotData[] = [];
    
    // Add legacy screenshot if it exists
    if (step.screenshot) {
      screenshots.push(step.screenshot);
    }
    
    // Add new screenshots array
    if (step.screenshots && step.screenshots.length > 0) {
      screenshots.push(...step.screenshots);
    }
    
    return screenshots;
  }, [step.screenshot, step.screenshots]);

  // Create a new screenshot object
  const createScreenshot = useCallback((dataUrl: string, title?: string): ScreenshotData => {
    return {
      id: uuidv4(),
      dataUrl,
      callouts: [],
      title: title || `Screenshot ${getAllScreenshots().length + 1}`
    };
  }, [getAllScreenshots]);

  // Add a new screenshot
  const addScreenshot = useCallback((dataUrl: string, title?: string) => {
    if (!onStepChange) return;

    const newScreenshot = createScreenshot(dataUrl, title);
    const existingScreenshots = getAllScreenshots();

    if (existingScreenshots.length === 0) {
      // First screenshot - set as main screenshot for backward compatibility
      onStepChange(stepId, "screenshot", newScreenshot);
    } else {
      // Additional screenshots - add to screenshots array
      const updatedScreenshots = [...(step.screenshots || []), newScreenshot];
      onStepChange(stepId, "screenshots", updatedScreenshots);
    }
  }, [stepId, onStepChange, createScreenshot, getAllScreenshots, step.screenshots]);

  // Update a specific screenshot
  const updateScreenshot = useCallback((screenshotId: string, updates: Partial<ScreenshotData>) => {
    if (!onStepChange) return;

    // Update legacy screenshot
    if (step.screenshot?.id === screenshotId) {
      onStepChange(stepId, "screenshot", { ...step.screenshot, ...updates });
      return;
    }

    // Update in screenshots array
    if (step.screenshots) {
      const updatedScreenshots = step.screenshots.map(screenshot =>
        screenshot.id === screenshotId ? { ...screenshot, ...updates } : screenshot
      );
      onStepChange(stepId, "screenshots", updatedScreenshots);
    }
  }, [stepId, step.screenshot, step.screenshots, onStepChange]);

  // Delete a screenshot
  const deleteScreenshot = useCallback((screenshotId: string) => {
    if (!onStepChange) return;

    const allScreenshots = getAllScreenshots();
    if (allScreenshots.length <= 1) {
      throw new Error("Cannot delete the last screenshot. Each step must have at least one screenshot.");
    }

    // Delete legacy screenshot
    if (step.screenshot?.id === screenshotId) {
      onStepChange(stepId, "screenshot", null);
      return;
    }

    // Delete from screenshots array
    if (step.screenshots) {
      const updatedScreenshots = step.screenshots.filter(screenshot => screenshot.id !== screenshotId);
      onStepChange(stepId, "screenshots", updatedScreenshots);
    }
  }, [stepId, step.screenshot, step.screenshots, onStepChange, getAllScreenshots]);

  // Replace a screenshot (used for editing/cropping)
  const replaceScreenshot = useCallback((screenshotId: string, newDataUrl: string) => {
    updateScreenshot(screenshotId, { dataUrl: newDataUrl });
  }, [updateScreenshot]);

  // File upload integration
  const fileUpload = useFileUpload({
    onSuccess: (dataUrl, file) => {
      addScreenshot(dataUrl, file.name.split('.')[0]);
    }
  });

  return {
    // Data
    screenshots: getAllScreenshots(),
    hasScreenshots: getAllScreenshots().length > 0,
    
    // Actions
    addScreenshot,
    updateScreenshot,
    deleteScreenshot,
    replaceScreenshot,
    
    // File upload
    ...fileUpload
  };
}; 