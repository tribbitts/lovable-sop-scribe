import { v4 as uuidv4 } from "uuid";
import { SopDocument, Callout, ScreenshotData } from "@/types/sop";

export class ScreenshotManager {
  // Legacy methods for backward compatibility
  static setStepScreenshot(document: SopDocument, stepId: string, dataUrl: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            screenshot: {
              id: uuidv4(),
              dataUrl,
              originalDataUrl: dataUrl,
              callouts: step.screenshot?.callouts || [],
              isCropped: false
            },
          };
        }
        return step;
      }),
    };
  }

  // New methods for multiple screenshots
  static addStepScreenshot(document: SopDocument, stepId: string, dataUrl: string, title?: string, description?: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId) {
          const newScreenshot: ScreenshotData = {
            id: uuidv4(),
            dataUrl,
            originalDataUrl: dataUrl,
            callouts: [],
            isCropped: false,
            title,
            description
          };

          const currentScreenshots = step.screenshots || [];
          
          return {
            ...step,
            screenshots: [...currentScreenshots, newScreenshot],
            // If this is the first screenshot, also set it as the legacy screenshot
            screenshot: currentScreenshots.length === 0 ? newScreenshot : step.screenshot
          };
        }
        return step;
      }),
    };
  }

  static updateStepScreenshot(document: SopDocument, stepId: string, screenshotId: string, updates: Partial<ScreenshotData>): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId && step.screenshots) {
          const updatedScreenshots = step.screenshots.map((screenshot) =>
            screenshot.id === screenshotId ? { ...screenshot, ...updates } : screenshot
          );

          return {
            ...step,
            screenshots: updatedScreenshots,
            // Update legacy screenshot if it's the first one
            screenshot: updatedScreenshots[0]?.id === screenshotId ? updatedScreenshots[0] : step.screenshot
          };
        }
        return step;
      }),
    };
  }

  static deleteStepScreenshot(document: SopDocument, stepId: string, screenshotId: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId && step.screenshots) {
          const filteredScreenshots = step.screenshots.filter((screenshot) => screenshot.id !== screenshotId);
          
          return {
            ...step,
            screenshots: filteredScreenshots,
            // Update legacy screenshot if we deleted it
            screenshot: step.screenshot?.id === screenshotId ? (filteredScreenshots[0] || null) : step.screenshot
          };
        }
        return step;
      }),
    };
  }

  static reorderStepScreenshots(document: SopDocument, stepId: string, fromIndex: number, toIndex: number): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId && step.screenshots) {
          const screenshots = [...step.screenshots];
          const [movedScreenshot] = screenshots.splice(fromIndex, 1);
          screenshots.splice(toIndex, 0, movedScreenshot);
          
          return {
            ...step,
            screenshots,
            screenshot: screenshots[0] || null // First screenshot becomes legacy
          };
        }
        return step;
      }),
    };
  }

  static cropStepScreenshot(document: SopDocument, stepId: string, screenshotId: string, croppedDataUrl: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId) {
          // Handle legacy screenshot
          if (step.screenshot?.id === screenshotId) {
            return {
              ...step,
              screenshot: {
                ...step.screenshot,
                dataUrl: croppedDataUrl,
                isCropped: true
              },
            };
          }
          
          // Handle screenshots array
          if (step.screenshots) {
            const updatedScreenshots = step.screenshots.map((screenshot) =>
              screenshot.id === screenshotId
                ? { ...screenshot, dataUrl: croppedDataUrl, isCropped: true }
                : screenshot
            );
            
            return {
              ...step,
              screenshots: updatedScreenshots,
              screenshot: step.screenshot?.id === screenshotId ? updatedScreenshots.find(s => s.id === screenshotId) || step.screenshot : step.screenshot
            };
          }
        }
        return step;
      }),
    };
  }

  static undoCropStepScreenshot(document: SopDocument, stepId: string, screenshotId: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId) {
          // Handle legacy screenshot
          if (step.screenshot?.id === screenshotId && step.screenshot.originalDataUrl) {
            return {
              ...step,
              screenshot: {
                ...step.screenshot,
                dataUrl: step.screenshot.originalDataUrl,
                isCropped: false
              },
            };
          }
          
          // Handle screenshots array
          if (step.screenshots) {
            const updatedScreenshots = step.screenshots.map((screenshot) =>
              screenshot.id === screenshotId && screenshot.originalDataUrl
                ? { ...screenshot, dataUrl: screenshot.originalDataUrl, isCropped: false }
                : screenshot
            );
            
            return {
              ...step,
              screenshots: updatedScreenshots,
              screenshot: step.screenshot?.id === screenshotId ? updatedScreenshots.find(s => s.id === screenshotId) || step.screenshot : step.screenshot
            };
          }
        }
        return step;
      }),
    };
  }

  // Callout methods updated to work with specific screenshots
  static addCalloutToScreenshot(document: SopDocument, stepId: string, screenshotId: string, callout: Omit<Callout, "id">): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId) {
          // Handle legacy screenshot
          if (step.screenshot?.id === screenshotId) {
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
          
          // Handle screenshots array
          if (step.screenshots) {
            const updatedScreenshots = step.screenshots.map((screenshot) =>
              screenshot.id === screenshotId
                ? {
                    ...screenshot,
                    callouts: [...screenshot.callouts, { ...callout, id: uuidv4() }],
                  }
                : screenshot
            );
            
            return {
              ...step,
              screenshots: updatedScreenshots,
              screenshot: step.screenshot?.id === screenshotId ? updatedScreenshots.find(s => s.id === screenshotId) || step.screenshot : step.screenshot
            };
          }
        }
        return step;
      }),
    };
  }

  // Legacy callout methods (for backward compatibility)
  static addCallout(document: SopDocument, stepId: string, callout: Omit<Callout, "id">): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
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
    };
  }

  static setStepSecondaryScreenshot(document: SopDocument, stepId: string, dataUrl: string): SopDocument {
    // Convert to use the new multiple screenshots system
    return ScreenshotManager.addStepScreenshot(document, stepId, dataUrl, "Secondary Image");
  }

  static updateCallout(document: SopDocument, stepId: string, callout: Callout): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
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
    };
  }

  static deleteCallout(document: SopDocument, stepId: string, calloutId: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
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
    };
  }

  // Legacy secondary callout methods replaced by addCalloutToScreenshot with specific screenshotId
  static addSecondaryCallout(document: SopDocument, stepId: string, callout: Omit<Callout, "id">): SopDocument {
    // Find the second screenshot in the array, or use the new multi-screenshot system
    const step = document.steps.find(s => s.id === stepId);
    if (step?.screenshots && step.screenshots[1]) {
      return ScreenshotManager.addCalloutToScreenshot(document, stepId, step.screenshots[1].id, callout);
    }
    // Fallback to adding to primary screenshot
    return ScreenshotManager.addCallout(document, stepId, callout);
  }

  static updateSecondaryCallout(document: SopDocument, stepId: string, callout: Callout): SopDocument {
    // Convert to use the new system - find which screenshot contains this callout
    const step = document.steps.find(s => s.id === stepId);
    if (step?.screenshots) {
      for (const screenshot of step.screenshots) {
        if (screenshot.callouts.some(c => c.id === callout.id)) {
          return ScreenshotManager.updateCalloutInScreenshot(document, stepId, screenshot.id, callout);
        }
      }
    }
    // Fallback to legacy method
    return ScreenshotManager.updateCallout(document, stepId, callout);
  }

  static deleteSecondaryCallout(document: SopDocument, stepId: string, calloutId: string): SopDocument {
    // Convert to use the new system - find which screenshot contains this callout
    const step = document.steps.find(s => s.id === stepId);
    if (step?.screenshots) {
      for (const screenshot of step.screenshots) {
        if (screenshot.callouts.some(c => c.id === calloutId)) {
          return ScreenshotManager.deleteCalloutFromScreenshot(document, stepId, screenshot.id, calloutId);
        }
      }
    }
    // Fallback to legacy method
    return ScreenshotManager.deleteCallout(document, stepId, calloutId);
  }

  // New methods for working with callouts in specific screenshots
  static updateCalloutInScreenshot(document: SopDocument, stepId: string, screenshotId: string, callout: Callout): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId) {
          // Handle legacy screenshot
          if (step.screenshot?.id === screenshotId) {
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
          
          // Handle screenshots array
          if (step.screenshots) {
            const updatedScreenshots = step.screenshots.map((screenshot) =>
              screenshot.id === screenshotId
                ? {
                    ...screenshot,
                    callouts: screenshot.callouts.map((c) =>
                      c.id === callout.id ? callout : c
                    ),
                  }
                : screenshot
            );
            
            return {
              ...step,
              screenshots: updatedScreenshots,
              screenshot: step.screenshot?.id === screenshotId ? updatedScreenshots.find(s => s.id === screenshotId) || step.screenshot : step.screenshot
            };
          }
        }
        return step;
      }),
    };
  }

  static deleteCalloutFromScreenshot(document: SopDocument, stepId: string, screenshotId: string, calloutId: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId) {
          // Handle legacy screenshot
          if (step.screenshot?.id === screenshotId) {
            return {
              ...step,
              screenshot: {
                ...step.screenshot,
                callouts: step.screenshot.callouts.filter((c) => c.id !== calloutId),
              },
            };
          }
          
          // Handle screenshots array
          if (step.screenshots) {
            const updatedScreenshots = step.screenshots.map((screenshot) =>
              screenshot.id === screenshotId
                ? {
                    ...screenshot,
                    callouts: screenshot.callouts.filter((c) => c.id !== calloutId),
                  }
                : screenshot
            );
            
            return {
              ...step,
              screenshots: updatedScreenshots,
              screenshot: step.screenshot?.id === screenshotId ? updatedScreenshots.find(s => s.id === screenshotId) || step.screenshot : step.screenshot
            };
          }
        }
        return step;
      }),
    };
  }
}
