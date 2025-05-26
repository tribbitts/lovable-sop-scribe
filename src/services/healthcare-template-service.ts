
import { HealthcareTemplate, healthcareTemplates, TemplateSection } from "@/types/healthcare-templates";
import { SopStep, HealthcareContent } from "@/types/sop";
import { v4 as uuidv4 } from "uuid";

export class HealthcareTemplateService {
  static getAllTemplates(): HealthcareTemplate[] {
    return healthcareTemplates;
  }

  static getTemplateById(id: string): HealthcareTemplate | undefined {
    return healthcareTemplates.find(template => template.id === id);
  }

  static getTemplatesByCategory(category: HealthcareTemplate['category']): HealthcareTemplate[] {
    return healthcareTemplates.filter(template => template.category === category);
  }

  static createStepsFromTemplate(templateId: string): SopStep[] {
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    return template.sections.map((section, index) => {
      const step: SopStep = {
        id: uuidv4(),
        title: section.title,
        description: section.suggestedContent,
        detailedInstructions: `Complete this section to understand: ${section.description}`,
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: section.estimatedTime,
        tags: [template.category, section.contentType],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 80
      };

      // Add healthcare content based on section type
      if (section.contentType === "safety-note") {
        step.healthcareContent = [{
          id: uuidv4(),
          type: "critical-safety",
          content: "This section contains critical patient safety information. Please review carefully.",
          priority: "high"
        }];
      }

      // Add quiz questions for required sections
      if (section.required && template.enabledFeatures.quizzes) {
        step.quizQuestions = [{
          id: uuidv4(),
          question: `What is the key takeaway from the ${section.title} section?`,
          type: "short-answer",
          correctAnswer: "Understanding and applying the concepts covered in this section is essential for patient care.",
          explanation: "This question helps reinforce the learning objectives for this section."
        }];
      }

      return step;
    });
  }

  static getTemplateFeatures(templateId: string) {
    const template = this.getTemplateById(templateId);
    return template?.enabledFeatures || {};
  }
}
