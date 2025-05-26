
import { HealthcareTemplate, healthcareTemplates, TemplateSection } from "@/types/healthcare-templates";
import { SopStep } from "@/types/sop";
import { HealthcareContent, HealthcareContentType } from "@/types/healthcare";
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
    const instructionMap: Record<string, string> = {
      // New Hire Onboarding
      "welcome": "Welcome to our healthcare organization! This section introduces you to our core values and patient-centered approach. Take time to understand how every role contributes to excellent patient care.",
      "patient-first": "Learn about our patient-first philosophy that guides every decision we make. Understanding this principle is crucial for all staff members, as it influences how we interact with patients, families, and each other.",
      "systems-navigation": "Master the essential healthcare systems and tools you'll use daily. These systems are critical for maintaining patient records, scheduling, and ensuring seamless care coordination.",
      "core-procedures": "Review the fundamental clerical and administrative procedures that support patient care. These standardized processes ensure consistency and quality in our operations.",
      "hipaa-privacy": "CRITICAL: Understand your legal obligations regarding patient privacy and HIPAA compliance. This is not optional - all healthcare staff must maintain strict confidentiality.",
      "emergency-protocols": "CRITICAL: Know the emergency procedures and escalation paths. In healthcare settings, quick and appropriate responses can be life-saving.",

      // Continued Learning
      "objective": "Understand the purpose and importance of this training update. Focus on how these changes improve patient care quality and enhance your daily workflow efficiency.",
      "key-changes": "Review and understand the key improvements being implemented. Pay special attention to how these changes enhance patient experience and streamline operations.",
      "protocol-details": "Study the detailed steps of updated procedures. Practice these procedures mentally until you feel confident implementing them in real patient interactions.",
      "practice-scenarios": "Apply your learning through realistic scenarios that mirror actual patient situations. These exercises prepare you for successful implementation.",
      "implementation-tips": "Learn practical strategies for smoothly transitioning to new procedures while maintaining excellent patient care standards.",

      // Communication Excellence
      "communication-foundations": "Master the fundamental principles of effective patient communication that build trust and improve health outcomes.",
      "difficult-conversations": "Develop skills for handling challenging situations with empathy while maintaining professionalism and achieving positive outcomes.",
      "cultural-sensitivity": "Build cultural competency to provide respectful, effective care to patients from diverse backgrounds and experiences.",
      "communication-practice": "Practice your communication skills through realistic scenarios to build confidence and expertise."
    };

    return instructionMap[section.id] || `Complete this section to understand: ${section.description}`;
  }

  private static generateHealthcareContent(section: TemplateSection, template: HealthcareTemplate): HealthcareContent[] {
    const content: HealthcareContent[] = [];

    // Add safety alerts for critical sections
    if (section.contentType === "safety-note" || ["hipaa-privacy", "emergency-protocols"].includes(section.id)) {
      content.push({
        id: uuidv4(),
        type: "critical-safety" as HealthcareContentType,
        content: this.getSafetyMessage(section.id),
        priority: "high"
      });
    }

    // Add patient communication guidance
    if (template.enabledFeatures.communicationSnippets && 
        (["patient-first", "core-procedures", "difficult-conversations", "communication-practice"].includes(section.id))) {
      content.push({
        id: uuidv4(),
        type: "patient-communication" as HealthcareContentType,
        content: this.getCommunicationSnippet(section.id),
        priority: "medium"
      });
    }

    // Add scenario-based content for continued learning
    if (section.contentType === "scenario" && template.category === "continued-learning") {
      content.push({
        id: uuidv4(),
        type: "scenario-guidance" as HealthcareContentType,
        content: this.getScenarioGuidance(section.id),
        priority: "medium"
      });
    }

    // Add HIPAA alerts where relevant
    if (["systems-navigation", "core-procedures", "protocol-details"].includes(section.id)) {
      content.push({
        id: uuidv4(),
        type: "hipaa-alert" as HealthcareContentType,
        content: "Remember: All patient information accessed through these systems is protected under HIPAA. Only access information necessary for your job duties.",
        priority: "high"
      });
    }

    return content;
  }

  private static getSafetyMessage(sectionId: string): string {
    const messages: Record<string, string> = {
      "hipaa-privacy": "🚨 CRITICAL: HIPAA violations can result in fines up to $1.5 million and criminal charges. Never share patient information inappropriately.",
      "emergency-protocols": "🚨 CRITICAL: In medical emergencies, immediately call 911 and notify the charge nurse. Every second counts in emergency situations.",
      "systems-navigation": "⚠️ IMPORTANT: System access is logged and monitored. Only access patient records when necessary for patient care.",
      "protocol-details": "⚠️ IMPORTANT: These updated procedures directly impact patient safety and care quality. Follow them precisely."
    };
    return messages[sectionId] || "⚠️ This section contains important safety information for patient care.";
  }

  private static getCommunicationSnippet(sectionId: string): string {
    const snippets: Record<string, string> = {
      "patient-first": "💬 Sample phrases: 'How can I help you today?' | 'Let me make sure I understand your concern.' | 'I'll get that information for you right away.'",
      "core-procedures": "💬 Professional language: 'I'll verify that information for you.' | 'Please allow me a moment to review your account.' | 'I want to ensure everything is accurate.'",
      "difficult-conversations": "💬 De-escalation phrases: 'I understand your frustration.' | 'Let me see how I can help resolve this.' | 'Your concerns are important to us.'",
      "communication-practice": "💬 Best practices: Use active listening | Speak clearly and slowly | Confirm understanding | Show empathy"
    };
    return snippets[sectionId] || "💬 Use professional, empathetic language when communicating with patients and families.";
  }

  private static getScenarioGuidance(sectionId: string): string {
    const guidance: Record<string, string> = {
      "practice-scenarios": "🎯 Practice Tip: Work through each scenario carefully, considering both the immediate response and long-term patient relationship impact.",
      "application-scenarios": "🎯 Application Focus: Think about how these changes will affect your daily interactions with patients and colleagues."
    };
    return guidance[sectionId] || "🎯 Apply the concepts learned to realistic patient care situations.";
  }

  private static generateQuizQuestions(section: TemplateSection, template: HealthcareTemplate): any[] {
    if (!template.enabledFeatures.quizzes || !section.required) {
      return [];
    }

    const questions: Record<string, any> = {
      // New Hire Questions
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
      },

      // Continued Learning Questions
      "objective": {
        question: "Why are training updates important in healthcare settings?",
        type: "multiple-choice",
        options: ["To meet compliance requirements", "To improve patient care and operational efficiency", "To reduce costs", "To satisfy administrators"],
        correctAnswer: "To improve patient care and operational efficiency",
        explanation: "Training updates ensure we continuously improve patient care quality while enhancing workflow efficiency."
      },
      "key-changes": {
        question: "What should be your primary focus when learning about new changes?",
        type: "short-answer",
        correctAnswer: "How the changes enhance patient experience and improve care quality",
        explanation: "New procedures are designed to benefit patients first, while also improving operational effectiveness."
      },
      "protocol-details": {
        question: "Before implementing new procedures, you should:",
        type: "multiple-choice",
        options: ["Wait for more training", "Practice them until confident", "Ask a colleague first", "Implement immediately"],
        correctAnswer: "Practice them until confident",
        explanation: "Confidence in new procedures ensures smooth implementation and maintains high-quality patient care."
      },

      // Communication Questions
      "communication-foundations": {
        question: "What is the most important aspect of patient communication?",
        type: "multiple-choice",
        options: ["Speaking quickly", "Being technically accurate", "Building trust and understanding", "Following scripts"],
        correctAnswer: "Building trust and understanding",
        explanation: "Effective patient communication focuses on building trust, which improves health outcomes and patient satisfaction."
      },
      "difficult-conversations": {
        question: "When dealing with an upset patient, your first response should be:",
        type: "short-answer",
        correctAnswer: "Acknowledge their feelings and listen actively to understand their concerns",
        explanation: "Validation and active listening help de-escalate situations and show patients that their concerns matter."
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

  static getRecommendedTemplateForRole(role: "new-hire" | "veteran" | "communication-focused"): HealthcareTemplate | undefined {
    const roleMapping = {
      "new-hire": "healthcare-new-hire",
      "veteran": "healthcare-continued-learning", 
      "communication-focused": "healthcare-communication-excellence"
    };
    
    return this.getTemplateById(roleMapping[role]);
  }
}
