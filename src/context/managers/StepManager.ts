import { v4 as uuidv4 } from "uuid";
import { SopDocument, SopStep, StepResource, HealthcareContent } from "@/types/sop";

export class StepManager {
  static addStep(document: SopDocument): SopDocument {
    return StepManager.addStepFromTemplate(document, "standard");
  }

  // Detect if this is a healthcare document based on existing content
  private static isHealthcareDocument(document: SopDocument): boolean {
    return document.steps.some(step => 
      step.healthcareContent && step.healthcareContent.length > 0
    ) || document.title.toLowerCase().includes('healthcare') ||
    document.title.toLowerCase().includes('patient') ||
    document.title.toLowerCase().includes('hipaa') ||
    document.title.toLowerCase().includes('medical');
  }

  // Detect the specific healthcare template type
  private static getHealthcareTemplateType(document: SopDocument): string | null {
    const title = document.title.toLowerCase();
    
    if (title.includes('new hire') || title.includes('onboarding')) {
      return 'new-hire-onboarding';
    }
    if (title.includes('continued learning') || title.includes('professional development')) {
      return 'continued-learning';
    }
    if (title.includes('communication') || title.includes('patient communication')) {
      return 'communication-excellence';
    }
    
    return 'healthcare-general';
  }

  static addStepFromTemplate(
    document: SopDocument, 
    templateType: "standard" | "knowledge-check" | "scenario" | "resource-focus"
  ): SopDocument {
    const isHealthcare = StepManager.isHealthcareDocument(document);
    const healthcareType = isHealthcare ? StepManager.getHealthcareTemplateType(document) : null;
    
    const baseStep: SopStep = {
      id: uuidv4(),
      title: "",
      description: "",
      screenshot: null,
      screenshots: [],
      completed: false,
      trainingMode: document.trainingMode !== false,
    };

    let templatedStep: SopStep;
    
    switch (templateType) {
      case "knowledge-check":
        templatedStep = StepManager.createKnowledgeCheckStep(baseStep, isHealthcare, healthcareType);
        break;
        
      case "scenario":
        templatedStep = StepManager.createScenarioStep(baseStep, isHealthcare, healthcareType);
        break;
        
      case "resource-focus":
        templatedStep = StepManager.createResourceStep(baseStep, isHealthcare, healthcareType);
        break;
        
      default:
        templatedStep = StepManager.createStandardStep(baseStep, isHealthcare, healthcareType);
        break;
    }

    return {
      ...document,
      steps: [...document.steps, templatedStep]
    };
  }

  private static createStandardStep(baseStep: SopStep, isHealthcare: boolean, healthcareType: string | null): SopStep {
    if (!isHealthcare) {
      return {
        ...baseStep,
        title: "",
        description: "",
        estimatedTime: 5,
      };
    }

    // Healthcare-specific standard step templates
    switch (healthcareType) {
      case 'new-hire-onboarding':
        return {
          ...baseStep,
          title: "Additional Training Module",
          description: "Complete this essential training component for your healthcare role.",
          estimatedTime: 15,
          tags: ["training", "healthcare", "onboarding"],
          trainingMode: true,
          allowRetakes: true,
          requiredScore: 80,
          healthcareContent: [
            {
              id: uuidv4(),
              type: "standard",
              content: "This training module is designed to enhance your understanding of healthcare procedures and patient care standards.",
              priority: "medium"
            }
          ]
        };

      case 'continued-learning':
        return {
          ...baseStep,
          title: "Professional Development Module",
          description: "Enhance your skills with this evidence-based learning module.",
          estimatedTime: 20,
          tags: ["professional-development", "evidence-based", "healthcare"],
          trainingMode: true,
          allowRetakes: true,
          requiredScore: 75,
          healthcareContent: [
            {
              id: uuidv4(),
              type: "scenario-guidance",
              content: "🎯 Learning Objective: Apply new knowledge to improve patient care outcomes and operational efficiency.",
              priority: "medium"
            }
          ]
        };

      case 'communication-excellence':
        return {
          ...baseStep,
          title: "Communication Skills Practice",
          description: "Develop advanced patient communication techniques through guided practice.",
          estimatedTime: 25,
          tags: ["communication", "patient-interaction", "skills"],
          trainingMode: true,
          allowRetakes: true,
          requiredScore: 85,
          healthcareContent: [
            {
              id: uuidv4(),
              type: "patient-communication",
              content: "💬 Practice Tip: Focus on active listening and empathetic responses to build trust with patients and families.",
              priority: "high"
            }
          ]
        };

      default:
        return {
          ...baseStep,
          title: "Healthcare Procedure",
          description: "Follow these steps to complete this healthcare procedure safely and effectively.",
          estimatedTime: 10,
          tags: ["healthcare", "procedure"],
          trainingMode: true,
          healthcareContent: [
            {
              id: uuidv4(),
              type: "standard",
              content: "Ensure all safety protocols are followed during this procedure.",
              priority: "high"
            }
          ]
        };
    }
  }

  private static createKnowledgeCheckStep(baseStep: SopStep, isHealthcare: boolean, healthcareType: string | null): SopStep {
    const standardQuiz = {
      id: uuidv4(),
      question: "",
      type: "multiple-choice" as const,
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: ""
    };

    if (!isHealthcare) {
      return {
        ...baseStep,
        title: "Knowledge Check",
        description: "Test understanding of the previous concepts",
        estimatedTime: 3,
        keyTakeaway: "Verify comprehension before moving forward",
        quizQuestions: [standardQuiz]
      };
    }

    // Healthcare-specific knowledge check templates
    switch (healthcareType) {
      case 'new-hire-onboarding':
        return {
          ...baseStep,
          title: "Compliance Knowledge Check",
          description: "Verify your understanding of critical healthcare compliance requirements.",
          estimatedTime: 5,
          tags: ["knowledge-check", "compliance", "critical"],
          trainingMode: true,
          requiredScore: 90,
          keyTakeaway: "Compliance knowledge is essential for patient safety and legal protection",
          healthcareContent: [
            {
              id: uuidv4(),
              type: "critical-safety",
              content: "⚠️ IMPORTANT: This knowledge check covers critical compliance requirements. A passing score is mandatory.",
              priority: "high"
            }
          ],
          quizQuestions: [{
            ...standardQuiz,
            question: "What is the most important principle when handling patient information?",
            options: [
              "Speed of processing",
              "Patient privacy and confidentiality",
              "Cost efficiency",
              "Administrative convenience"
            ],
            correctAnswer: "Patient privacy and confidentiality",
            explanation: "Patient privacy and confidentiality are fundamental to healthcare compliance and building trust."
          }]
        };

      case 'communication-excellence':
        return {
          ...baseStep,
          title: "Communication Skills Assessment",
          description: "Evaluate your understanding of therapeutic communication techniques.",
          estimatedTime: 7,
          tags: ["knowledge-check", "communication", "assessment"],
          trainingMode: true,
          requiredScore: 85,
          keyTakeaway: "Effective communication directly impacts patient satisfaction and care outcomes",
          healthcareContent: [
            {
              id: uuidv4(),
              type: "patient-communication",
              content: "💬 Assessment Focus: Demonstrate understanding of empathetic communication and de-escalation techniques.",
              priority: "high"
            }
          ],
          quizQuestions: [{
            ...standardQuiz,
            question: "When a patient expresses frustration, what is the best initial response?",
            options: [
              "Explain why they shouldn't be frustrated",
              "Acknowledge their feelings and ask how you can help",
              "Redirect them to speak with someone else",
              "Provide immediate solutions without listening"
            ],
            correctAnswer: "Acknowledge their feelings and ask how you can help",
            explanation: "Acknowledging feelings validates the patient's experience and opens the door for constructive problem-solving."
          }]
        };

      default:
        return {
          ...baseStep,
          title: "Healthcare Knowledge Check",
          description: "Assess your understanding of this healthcare procedure or concept.",
          estimatedTime: 5,
          tags: ["knowledge-check", "healthcare"],
          trainingMode: true,
          requiredScore: 80,
          keyTakeaway: "Understanding healthcare procedures is critical for patient safety",
          healthcareContent: [
            {
              id: uuidv4(),
              type: "standard",
              content: "This assessment ensures you understand the key concepts before proceeding.",
              priority: "medium"
            }
          ],
          quizQuestions: [standardQuiz]
        };
    }
  }

  private static createScenarioStep(baseStep: SopStep, isHealthcare: boolean, healthcareType: string | null): SopStep {
    if (!isHealthcare) {
      return {
        ...baseStep,
        title: "Real-World Scenario",
        description: "See how this applies in a practical situation",
        estimatedTime: 5,
        keyTakeaway: "Understanding practical application is key to retention",
        detailedInstructions: "Describe a specific scenario where this knowledge would be applied...",
      };
    }

    // Healthcare-specific scenario templates
    switch (healthcareType) {
      case 'new-hire-onboarding':
        return {
          ...baseStep,
          title: "Patient Care Scenario",
          description: "Apply your training knowledge to a realistic patient care situation.",
          estimatedTime: 15,
          tags: ["scenario", "patient-care", "application"],
          trainingMode: true,
          keyTakeaway: "Real-world application reinforces learning and builds confidence",
          detailedInstructions: "You are working with a patient who has questions about their treatment plan. Walk through how you would handle this situation using the principles you've learned.",
          healthcareContent: [
            {
              id: uuidv4(),
              type: "scenario-guidance",
              content: "🎯 Scenario Focus: Consider patient safety, communication, and compliance requirements in your response.",
              priority: "high"
            },
            {
              id: uuidv4(),
              type: "patient-communication",
              content: "💬 Remember: Use active listening, show empathy, and maintain professional boundaries.",
              priority: "medium"
            }
          ]
        };

      case 'communication-excellence':
        return {
          ...baseStep,
          title: "Difficult Conversation Scenario",
          description: "Practice handling a challenging patient interaction with professionalism and empathy.",
          estimatedTime: 20,
          tags: ["scenario", "difficult-conversation", "de-escalation"],
          trainingMode: true,
          keyTakeaway: "Practicing difficult scenarios builds confidence and improves patient relationships",
          detailedInstructions: "A patient's family member is upset about wait times and is raising their voice. Demonstrate how you would de-escalate this situation while maintaining a therapeutic relationship.",
          healthcareContent: [
            {
              id: uuidv4(),
              type: "patient-communication",
              content: "💬 De-escalation Strategy: Stay calm, acknowledge concerns, and focus on solutions while maintaining empathy.",
              priority: "high"
            },
            {
              id: uuidv4(),
              type: "scenario-guidance",
              content: "🎯 Practice Goal: Transform a negative interaction into a positive patient experience.",
              priority: "medium"
            }
          ]
        };

      default:
        return {
          ...baseStep,
          title: "Healthcare Scenario",
          description: "Apply healthcare knowledge to a realistic clinical situation.",
          estimatedTime: 10,
          tags: ["scenario", "healthcare", "clinical"],
          trainingMode: true,
          keyTakeaway: "Scenario-based learning improves clinical decision-making skills",
          detailedInstructions: "Consider how you would handle this healthcare situation, keeping patient safety and best practices in mind.",
          healthcareContent: [
            {
              id: uuidv4(),
              type: "scenario-guidance",
              content: "🎯 Consider: Patient safety, evidence-based practices, and effective communication.",
              priority: "medium"
            }
          ]
        };
    }
  }

  private static createResourceStep(baseStep: SopStep, isHealthcare: boolean, healthcareType: string | null): SopStep {
    const standardResource = {
      id: uuidv4(),
      type: "link" as const,
      title: "",
      url: "",
      description: ""
    };

    if (!isHealthcare) {
      return {
        ...baseStep,
        title: "Additional Resources",
        description: "Explore supporting materials and references",
        estimatedTime: 10,
        keyTakeaway: "These resources provide deeper insights for continued learning",
        resources: [standardResource]
      };
    }

    // Healthcare-specific resource templates
    switch (healthcareType) {
      case 'new-hire-onboarding':
        return {
          ...baseStep,
          title: "Essential Healthcare Resources",
          description: "Access important references and continuing education materials for healthcare professionals.",
          estimatedTime: 15,
          tags: ["resources", "reference", "continuing-education"],
          keyTakeaway: "These resources support ongoing professional development and compliance",
          healthcareContent: [
            {
              id: uuidv4(),
              type: "standard",
              content: "Bookmark these resources for quick access during your daily work and ongoing professional development.",
              priority: "medium"
            }
          ],
          resources: [
            {
              id: uuidv4(),
              type: "link",
              title: "HIPAA Compliance Guidelines",
              url: "https://www.hhs.gov/hipaa/",
              description: "Official HIPAA compliance information and updates"
            },
            {
              id: uuidv4(),
              type: "link",
              title: "Patient Safety Resources",
              url: "",
              description: "Evidence-based patient safety protocols and best practices"
            }
          ]
        };

      case 'communication-excellence':
        return {
          ...baseStep,
          title: "Communication Excellence Resources",
          description: "Explore advanced communication techniques and cultural competency materials.",
          estimatedTime: 20,
          tags: ["resources", "communication", "cultural-competency"],
          keyTakeaway: "Continuous learning in communication skills enhances patient care quality",
          healthcareContent: [
            {
              id: uuidv4(),
              type: "patient-communication",
              content: "💬 Resource Focus: These materials will help you develop advanced therapeutic communication skills.",
              priority: "medium"
            }
          ],
          resources: [
            {
              id: uuidv4(),
              type: "link",
              title: "Therapeutic Communication Techniques",
              url: "",
              description: "Advanced techniques for building rapport and trust with patients"
            },
            {
              id: uuidv4(),
              type: "link",
              title: "Cultural Competency in Healthcare",
              url: "",
              description: "Resources for providing culturally sensitive patient care"
            }
          ]
        };

      default:
        return {
          ...baseStep,
          title: "Healthcare Reference Materials",
          description: "Access relevant healthcare guidelines, protocols, and educational resources.",
          estimatedTime: 12,
          tags: ["resources", "healthcare", "reference"],
          keyTakeaway: "These resources support evidence-based practice and professional growth",
          healthcareContent: [
            {
              id: uuidv4(),
              type: "standard",
              content: "These resources provide evidence-based information to support quality patient care.",
              priority: "medium"
            }
          ],
          resources: [standardResource]
        };
    }
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
      screenshots: originalStep.screenshots?.map(screenshot => ({
        ...screenshot,
        id: uuidv4(),
        callouts: screenshot.callouts.map(callout => ({
          ...callout,
          id: uuidv4()
        }))
      })) || [],
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
            resources: currentResources.map(resource =>
              resource.id === resourceId ? { ...resource, ...updates } : resource
            )
          };
        }
        return step;
      }),
    };
  }
}
