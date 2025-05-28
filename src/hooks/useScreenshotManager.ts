
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
 * Simplified screenshot management hook
 * Fixes TypeScript errors and integration issues
 */
export const useScreenshotManager = ({ stepId, step, onStepChange }: ScreenshotManagerOptions) => {
  
  // Get all screenshots safely
  const getAllScreenshots = useCallback((): ScreenshotData[] => {
    const screenshots: ScreenshotData[] = [];
    
    if (step.screenshot) {
      screenshots.push(step.screenshot);
    }
    
    if (step.screenshots && Array.isArray(step.screenshots)) {
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
    if (!onStepChange) {
      console.warn('onStepChange callback not provided to useScreenshotManager');
      return;
    }

    try {
      const newScreenshot = createScreenshot(dataUrl, title);
      const existingScreenshots = getAllScreenshots();

      if (existingScreenshots.length === 0) {
        onStepChange(stepId, "screenshot", newScreenshot);
      } else {
        const updatedScreenshots = [...(step.screenshots || []), newScreenshot];
        onStepChange(stepId, "screenshots", updatedScreenshots);
      }
    } catch (error) {
      console.error('Error adding screenshot:', error);
    }
  }, [stepId, onStepChange, createScreenshot, getAllScreenshots, step.screenshots]);

  // Update a specific screenshot
  const updateScreenshot = useCallback((screenshotId: string, updates: Partial<ScreenshotData>) => {
    if (!onStepChange) return;

    try {
      if (step.screenshot?.id === screenshotId) {
        onStepChange(stepId, "screenshot", { ...step.screenshot, ...updates });
        return;
      }

      if (step.screenshots && Array.isArray(step.screenshots)) {
        const updatedScreenshots = step.screenshots.map(screenshot =>
          screenshot.id === screenshotId ? { ...screenshot, ...updates } : screenshot
        );
        onStepChange(stepId, "screenshots", updatedScreenshots);
      }
    } catch (error) {
      console.error('Error updating screenshot:', error);
    }
  }, [stepId, step.screenshot, step.screenshots, onStepChange]);

  // Delete a screenshot
  const deleteScreenshot = useCallback((screenshotId: string) => {
    if (!onStepChange) return;

    try {
      const allScreenshots = getAllScreenshots();
      if (allScreenshots.length <= 1) {
        console.warn("Cannot delete the last screenshot");
        return;
      }

      if (step.screenshot?.id === screenshotId) {
        onStepChange(stepId, "screenshot", null);
        return;
      }

      if (step.screenshots && Array.isArray(step.screenshots)) {
        const updatedScreenshots = step.screenshots.filter(screenshot => screenshot.id !== screenshotId);
        onStepChange(stepId, "screenshots", updatedScreenshots);
      }
    } catch (error) {
      console.error('Error deleting screenshot:', error);
    }
  }, [stepId, step.screenshot, step.screenshots, onStepChange, getAllScreenshots]);

  // Replace a screenshot
  const replaceScreenshot = useCallback((screenshotId: string, newDataUrl: string) => {
    updateScreenshot(screenshotId, { dataUrl: newDataUrl });
  }, [updateScreenshot]);

  // File upload integration with proper error handling
  const fileUpload = useFileUpload({
    onSuccess: (dataUrl, file) => {
      try {
        addScreenshot(dataUrl, file.name.split('.')[0]);
      } catch (error) {
        console.error('Error handling file upload success:', error);
      }
    },
    onError: (error) => {
      console.error('File upload error:', error);
    }
  });

  return {
    screenshots: getAllScreenshots(),
    hasScreenshots: getAllScreenshots().length > 0,
    addScreenshot,
    updateScreenshot,
    deleteScreenshot,
    replaceScreenshot,
    ...fileUpload
  };
};
