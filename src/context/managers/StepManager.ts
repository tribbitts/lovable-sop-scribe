
import { v4 as uuidv4 } from "uuid";
import { SopDocument, SopStep, StepResource } from "@/types/sop";

export class StepManager {
  static addStep(document: SopDocument): SopDocument {
    return StepManager.addStepFromTemplate(document, "standard");
  }

  static addStepFromTemplate(
    document: SopDocument, 
    templateType: "standard" | "knowledge-check" | "scenario" | "resource-focus"
  ): SopDocument {
    const baseStep: SopStep = {
      id: uuidv4(),
      title: "",
      description: "",
      screenshot: null,
      completed: false,
      trainingMode: document.trainingMode !== false,
    };

    let templatedStep: SopStep;
    
    switch (templateType) {
      case "knowledge-check":
        templatedStep = {
          ...baseStep,
          title: "Knowledge Check",
          description: "Test understanding of the previous concepts",
          estimatedTime: 3,
          keyTakeaway: "Verify comprehension before moving forward",
          quizQuestions: [{
            id: uuidv4(),
            question: "",
            type: "multiple-choice",
            options: ["", "", "", ""],
            correctAnswer: "",
            explanation: ""
          }]
        };
        break;
        
      case "scenario":
        templatedStep = {
          ...baseStep,
          title: "Real-World Scenario",
          description: "See how this applies in a practical situation",
          estimatedTime: 5,
          keyTakeaway: "Understanding practical application is key to retention",
          detailedInstructions: "Describe a specific scenario where this knowledge would be applied...",
        };
        break;
        
      case "resource-focus":
        templatedStep = {
          ...baseStep,
          title: "Additional Resources",
          description: "Explore supporting materials and references",
          estimatedTime: 10,
          keyTakeaway: "These resources provide deeper insights for continued learning",
          resources: [{
            id: uuidv4(),
            type: "link",
            title: "",
            url: "",
            description: ""
          }]
        };
        break;
        
      default:
        templatedStep = {
          ...baseStep,
          title: "",
          description: "",
          estimatedTime: 5,
        };
        break;
    }

    return {
      ...document,
      steps: [...document.steps, templatedStep]
    };
  }

  static updateStep(document: SopDocument, stepId: string, field: keyof SopStep, value: any): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step
      ),
    };
  }

  static moveStepUp(document: SopDocument, stepId: string): SopDocument {
    const stepIndex = document.steps.findIndex((step) => step.id === stepId);
    if (stepIndex <= 0) return document;

    const newSteps = [...document.steps];
    const temp = newSteps[stepIndex];
    newSteps[stepIndex] = newSteps[stepIndex - 1];
    newSteps[stepIndex - 1] = temp;

    return { ...document, steps: newSteps };
  }

  static moveStepDown(document: SopDocument, stepId: string): SopDocument {
    const stepIndex = document.steps.findIndex((step) => step.id === stepId);
    if (stepIndex === -1 || stepIndex >= document.steps.length - 1) return document;

    const newSteps = [...document.steps];
    const temp = newSteps[stepIndex];
    newSteps[stepIndex] = newSteps[stepIndex + 1];
    newSteps[stepIndex + 1] = temp;

    return { ...document, steps: newSteps };
  }

  static deleteStep(document: SopDocument, stepId: string): SopDocument {
    return {
      ...document,
      steps: document.steps.filter((step) => step.id !== stepId),
    };
  }

  static duplicateStep(document: SopDocument, stepId: string): SopDocument {
    const stepIndex = document.steps.findIndex((step) => step.id === stepId);
    if (stepIndex === -1) return document;

    const originalStep = document.steps[stepIndex];
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

    const newSteps = [...document.steps];
    newSteps.splice(stepIndex + 1, 0, duplicatedStep);

    return { ...document, steps: newSteps };
  }

  static toggleStepCompletion(document: SopDocument, stepId: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      ),
    };
  }

  static addStepTag(document: SopDocument, stepId: string, tag: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId) {
          const currentTags = step.tags || [];
          if (!currentTags.includes(tag)) {
            return { ...step, tags: [...currentTags, tag] };
          }
        }
        return step;
      }),
    };
  }

  static removeStepTag(document: SopDocument, stepId: string, tag: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId) {
          const currentTags = step.tags || [];
          return { ...step, tags: currentTags.filter(t => t !== tag) };
        }
        return step;
      }),
    };
  }

  static addStepResource(document: SopDocument, stepId: string, resource: StepResource): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId) {
          const currentResources = step.resources || [];
          return { ...step, resources: [...currentResources, resource] };
        }
        return step;
      }),
    };
  }

  static removeStepResource(document: SopDocument, stepId: string, resourceId: string): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
        if (step.id === stepId) {
          const currentResources = step.resources || [];
          return { ...step, resources: currentResources.filter(r => r.id !== resourceId) };
        }
        return step;
      }),
    };
  }

  static updateStepResource(document: SopDocument, stepId: string, resourceId: string, updates: Partial<StepResource>): SopDocument {
    return {
      ...document,
      steps: document.steps.map((step) => {
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
    };
  }
}
