
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
        detailedInstructions: this.generateDetailedInstructions(section, template),
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: section.estimatedTime,
        tags: [template.category, section.contentType],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 80,
        healthcareContent: this.generateHealthcareContent(section, template),
        quizQuestions: this.generateQuizQuestions(section, template)
      };

      return step;
    });
  }

  private static generateDetailedInstructions(section: TemplateSection, template: HealthcareTemplate): string {
    const baseInstructions = {
      "welcome": "Welcome to our healthcare organization! This section introduces you to our core values and patient-centered approach. Take time to understand how every role contributes to excellent patient care.",
      "patient-first": "Learn about our patient-first philosophy that guides every decision we make. Understanding this principle is crucial for all staff members, as it influences how we interact with patients, families, and each other.",
      "systems-navigation": "Master the essential healthcare systems and tools you'll use daily. These systems are critical for maintaining patient records, scheduling, and ensuring seamless care coordination.",
      "core-procedures": "Review the fundamental clerical and administrative procedures that support patient care. These standardized processes ensure consistency and quality in our operations.",
      "hipaa-privacy": "CRITICAL: Understand your legal obligations regarding patient privacy and HIPAA compliance. This is not optional - all healthcare staff must maintain strict confidentiality.",
      "emergency-protocols": "CRITICAL: Know the emergency procedures and escalation paths. In healthcare settings, quick and appropriate responses can be life-saving.",
      "objective": "Understand the purpose and importance of this training update. Focus on how these changes improve patient care and your daily workflow.",
      "key-changes": "Review and understand the key changes being implemented. Pay special attention to how these affect your specific role and responsibilities.",
      "protocol-details": "Study the detailed steps of new protocols. Practice these procedures until you feel confident implementing them in real situations.",
      "application-scenarios": "Apply your learning through realistic scenarios. These practice opportunities help you prepare for actual patient interactions."
    };

    return baseInstructions[section.id] || `Complete this section to understand: ${section.description}`;
  }

  private static generateHealthcareContent(section: TemplateSection, template: HealthcareTemplate): HealthcareContent[] {
    const content: HealthcareContent[] = [];

    // Add safety alerts for critical sections
    if (section.contentType === "safety-note" || section.id === "hipaa-privacy" || section.id === "emergency-protocols") {
      content.push({
        id: uuidv4(),
        type: "critical-safety",
        content: this.getSafetyMessage(section.id),
        priority: "high"
      });
    }

    // Add patient communication guidance
    if (template.enabledFeatures.communicationSnippets && (section.id === "patient-first" || section.id === "core-procedures")) {
      content.push({
        id: uuidv4(),
        type: "patient-communication",
        content: this.getCommunicationSnippet(section.id),
        priority: "medium"
      });
    }

    // Add HIPAA alerts where relevant
    if (section.id === "systems-navigation" || section.id === "core-procedures") {
      content.push({
        id: uuidv4(),
        type: "hipaa-alert",
        content: "Remember: All patient information accessed through these systems is protected under HIPAA. Only access information necessary for your job duties.",
        priority: "high"
      });
    }

    return content;
  }

  private static getSafetyMessage(sectionId: string): string {
    const messages = {
      "hipaa-privacy": "🚨 CRITICAL: HIPAA violations can result in fines up to $1.5 million and criminal charges. Never share patient information inappropriately.",
      "emergency-protocols": "🚨 CRITICAL: In medical emergencies, immediately call 911 and notify the charge nurse. Every second counts in emergency situations.",
      "systems-navigation": "⚠️ IMPORTANT: System access is logged and monitored. Only access patient records when necessary for patient care."
    };
    return messages[sectionId] || "⚠️ This section contains important safety information for patient care.";
  }

  private static getCommunicationSnippet(sectionId: string): string {
    const snippets = {
      "patient-first": "💬 Sample phrases: 'How can I help you today?' | 'Let me make sure I understand your concern.' | 'I'll get that information for you right away.'",
      "core-procedures": "💬 Professional language: 'I'll verify that information for you.' | 'Please allow me a moment to review your account.' | 'I want to ensure everything is accurate.'"
    };
    return snippets[sectionId] || "💬 Use professional, empathetic language when communicating with patients and families.";
  }

  private static generateQuizQuestions(section: TemplateSection, template: HealthcareTemplate): any[] {
    if (!template.enabledFeatures.quizzes || !section.required) {
      return [];
    }

    const questions = {
      "welcome": {
        question: "What is the primary focus of our healthcare organization?",
        type: "multiple-choice",
        options: ["Efficiency above all", "Patient-centered care", "Cost reduction", "Technology advancement"],
        correctAnswer: "Patient-centered care",
        explanation: "Our organization prioritizes patient-centered care, ensuring that all decisions are made with the patient's best interest in mind."
      },
      "patient-first": {
        question: "How should the patient-first philosophy influence your daily work?",
        type: "short-answer",
        correctAnswer: "Every action and decision should be evaluated based on how it impacts patient care and experience.",
        explanation: "The patient-first philosophy means considering patient needs and safety in every task, from scheduling to data entry."
      },
      "hipaa-privacy": {
        question: "What is the maximum penalty for willful HIPAA violations?",
        type: "multiple-choice",
        options: ["$100,000 fine", "$1.5 million fine and 10 years imprisonment", "$50,000 fine", "Job termination only"],
        correctAnswer: "$1.5 million fine and 10 years imprisonment",
        explanation: "HIPAA violations can result in severe penalties including substantial fines and criminal charges."
      },
      "emergency-protocols": {
        question: "What are the first two steps in a medical emergency?",
        type: "short-answer",
        correctAnswer: "Call 911 immediately and notify the charge nurse or supervisor",
        explanation: "Quick response is critical in emergencies. Always prioritize getting emergency medical help first."
      }
    };

    const questionData = questions[section.id];
    if (!questionData) return [];

    return [{
      id: uuidv4(),
      ...questionData
    }];
  }

  static getTemplateFeatures(templateId: string) {
    const template = this.getTemplateById(templateId);
    return template?.enabledFeatures || {};
  }
}
