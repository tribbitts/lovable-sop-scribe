import { SopDocument, SopStep } from "@/types/sop";

export class StepManager {
  static createStep(document: SopDocument, title: string = "", description: string = ""): SopStep {
    return {
      id: crypto.randomUUID(),
      title: title,
      description: description,
      screenshot: null,
      screenshots: [],
      resources: [],
      order: document.steps.length,
      completed: false,
      trainingMode: document.trainingMode || false
    };
  }

  static updateStep(document: SopDocument, stepId: string, field: keyof SopStep, value: any): SopDocument {
    return {
      ...document,
      steps: document.steps.map(step =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    };
  }

  static completeStep(document: SopDocument, stepId: string, completed: boolean): SopDocument {
    return {
      ...document,
      steps: document.steps.map(step =>
        step.id === stepId ? { ...step, completed: completed } : step
      )
    };
  }

  static addStep(document: SopDocument, step: SopStep): SopDocument {
    const newStep = { ...step, order: document.steps.length };
    return { ...document, steps: [...document.steps, newStep] };
  }

  static duplicateStep(document: SopDocument, stepId: string): SopDocument {
    const stepToDuplicate = document.steps.find(step => step.id === stepId);
    if (!stepToDuplicate) return document;

    const duplicatedStep: SopStep = {
      ...stepToDuplicate,
      id: crypto.randomUUID(),
      order: document.steps.length,
      title: `${stepToDuplicate.title} (Copy)`
    };

    return { ...document, steps: [...document.steps, duplicatedStep] };
  }

  static moveStep(document: SopDocument, stepId: string, direction: 'up' | 'down'): SopDocument {
    const stepIndex = document.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return document;

    const newSteps = [...document.steps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;

    if (targetIndex < 0 || targetIndex >= newSteps.length) return document;

    // Swap steps
    [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];

    // Update order
    newSteps.forEach((step, index) => {
      step.order = index;
    });

    return { ...document, steps: newSteps };
  }

  static deleteStep(document: SopDocument, stepId: string): SopDocument {
    return {
      ...document,
      steps: document.steps.filter(step => step.id !== stepId).map((step, index) => ({ ...step, order: index }))
    };
  }

  static updateStepOrder(document: SopDocument, stepId: string, newOrder: number): SopDocument {
    const stepIndex = document.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return document;

    const newSteps = [...document.steps];
    newSteps[stepIndex].order = newOrder;

    // Re-sort steps based on the updated order
    newSteps.sort((a, b) => a.order - b.order);

    // After sorting, ensure the order is sequential
    newSteps.forEach((step, index) => {
      step.order = index;
    });

    return { ...document, steps: newSteps };
  }
}
