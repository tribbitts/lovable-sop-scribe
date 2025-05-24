
import { v4 as uuidv4 } from "uuid";
import { SopDocument, Callout } from "@/types/sop";

export class ScreenshotManager {
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
              secondaryDataUrl: step.screenshot?.secondaryDataUrl,
              secondaryCallouts: step.screenshot?.secondaryCallouts || [],
              isCropped: false
            },
          };
        }
        return step;
      }),
    };
  }

  static setStepSecondaryScreenshot(document: SopDocument, stepId: string, dataUrl: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
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
    };
  }

  static cropStepScreenshot(document: SopDocument, stepId: string, croppedDataUrl: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
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
    };
  }

  static undoCropStepScreenshot(document: SopDocument, stepId: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
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
    };
  }

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

  static addSecondaryCallout(document: SopDocument, stepId: string, callout: Omit<Callout, "id">): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
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
    };
  }

  static updateSecondaryCallout(document: SopDocument, stepId: string, callout: Callout): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
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
    };
  }

  static deleteSecondaryCallout(document: SopDocument, stepId: string, calloutId: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
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
    };
  }
}
