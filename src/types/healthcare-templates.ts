
export interface TemplateSection {
  id: string;
  title: string;
  description: string;
  suggestedContent: string;
  contentType: "text" | "quiz" | "scenario" | "communication-tip" | "safety-note";
  required: boolean;
  estimatedTime?: number;
}

export interface HealthcareTemplate {
  id: string;
  name: string;
  description: string;
  category: "onboarding" | "continued-learning" | "communication" | "safety";
  icon: string;
  color: string;
  sections: TemplateSection[];
  enabledFeatures: {
    quizzes: boolean;
    progressTracking: boolean;
    certificates: boolean;
    bookmarks: boolean;
    patientCareRationales: boolean;
    scenarioBasedQuestions: boolean;
    communicationSnippets: boolean;
    redFlagIdentifiers: boolean;
  };
}

export const healthcareTemplates: HealthcareTemplate[] = [
  {
    id: "healthcare-new-hire",
    name: "Healthcare New Hire Onboarding",
    description: "Comprehensive onboarding for new healthcare clerical and administrative staff",
    category: "onboarding",
    icon: "UserPlus",
    color: "from-blue-600 to-indigo-600",
    sections: [
      {
        id: "welcome",
        title: "Welcome to Our Healthcare Team",
        description: "Introduction and overview of organizational values",
        suggestedContent: "Welcome to [Organization Name]. This training will help you understand our patient-first approach and core procedures.",
        contentType: "text",
        required: true,
        estimatedTime: 10
      },
      {
        id: "patient-first",
        title: "Patient-First Philosophy",
        description: "Understanding patient-centered care principles",
        suggestedContent: "Every action we take impacts patient care. Learn about our commitment to putting patients at the center of everything we do.",
        contentType: "text",
        required: true,
        estimatedTime: 15
      },
      {
        id: "systems-navigation",
        title: "Systems Navigation",
        description: "Overview of key healthcare systems and tools",
        suggestedContent: "Master the essential systems you'll use daily to support patient care and administrative efficiency.",
        contentType: "text",
        required: true,
        estimatedTime: 20
      },
      {
        id: "core-procedures",
        title: "Core Clerical Procedures",
        description: "Essential administrative procedures",
        suggestedContent: "Learn the fundamental procedures that ensure smooth operations and excellent patient experience.",
        contentType: "text",
        required: true,
        estimatedTime: 25
      },
      {
        id: "hipaa-privacy",
        title: "HIPAA & Privacy Compliance",
        description: "Critical privacy and compliance requirements",
        suggestedContent: "Understand your role in protecting patient privacy and maintaining HIPAA compliance.",
        contentType: "safety-note",
        required: true,
        estimatedTime: 20
      },
      {
        id: "emergency-protocols",
        title: "Emergency Protocols",
        description: "Emergency procedures and escalation paths",
        suggestedContent: "Know what to do in emergency situations to ensure patient safety and proper response.",
        contentType: "safety-note",
        required: true,
        estimatedTime: 15
      }
    ],
    enabledFeatures: {
      quizzes: true,
      progressTracking: true,
      certificates: true,
      bookmarks: true,
      patientCareRationales: true,
      scenarioBasedQuestions: true,
      communicationSnippets: true,
      redFlagIdentifiers: true
    }
  },
  {
    id: "healthcare-continued-learning",
    name: "Healthcare Continued Learning",
    description: "Updates and new initiatives for experienced healthcare staff",
    category: "continued-learning",
    icon: "BookOpen",
    color: "from-green-600 to-emerald-600",
    sections: [
      {
        id: "objective",
        title: "Objective of Update",
        description: "Purpose and goals of this training update",
        suggestedContent: "This update covers important changes to improve patient care and operational efficiency.",
        contentType: "text",
        required: true,
        estimatedTime: 5
      },
      {
        id: "key-changes",
        title: "Key Changes",
        description: "Summary of important changes",
        suggestedContent: "Review the key changes that affect your daily responsibilities and patient interactions.",
        contentType: "text",
        required: true,
        estimatedTime: 15
      },
      {
        id: "protocol-details",
        title: "New Protocol Details",
        description: "Detailed explanation of new procedures",
        suggestedContent: "Step-by-step guidance on implementing the new protocols in your workflow.",
        contentType: "text",
        required: true,
        estimatedTime: 20
      },
      {
        id: "application-scenarios",
        title: "Application Scenarios",
        description: "Real-world scenarios and practice opportunities",
        suggestedContent: "Practice applying the new protocols through realistic patient care scenarios.",
        contentType: "scenario",
        required: true,
        estimatedTime: 15
      }
    ],
    enabledFeatures: {
      quizzes: true,
      progressTracking: true,
      certificates: false,
      bookmarks: true,
      patientCareRationales: true,
      scenarioBasedQuestions: true,
      communicationSnippets: false,
      redFlagIdentifiers: true
    }
  }
];
