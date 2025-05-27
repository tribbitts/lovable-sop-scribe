
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
        title: "Training Update Overview",
        description: "Purpose and importance of this training update",
        suggestedContent: "This update covers important changes designed to improve patient care quality and operational efficiency.",
        contentType: "text",
        required: true,
        estimatedTime: 8
      },
      {
        id: "key-changes",
        title: "What's New",
        description: "Summary of key changes and improvements",
        suggestedContent: "Review the essential changes that will enhance your daily workflow and patient interactions.",
        contentType: "text",
        required: true,
        estimatedTime: 15
      },
      {
        id: "protocol-details",
        title: "Updated Procedures",
        description: "Step-by-step guidance for new protocols",
        suggestedContent: "Detailed walkthrough of the new procedures and how they integrate with your current responsibilities.",
        contentType: "text",
        required: true,
        estimatedTime: 20
      },
      {
        id: "practice-scenarios",
        title: "Real-World Application",
        description: "Interactive scenarios to practice new procedures",
        suggestedContent: "Apply your learning through realistic patient care scenarios that reflect common workplace situations.",
        contentType: "scenario",
        required: true,
        estimatedTime: 18
      },
      {
        id: "implementation-tips",
        title: "Implementation Best Practices",
        description: "Tips for smooth transition to new procedures",
        suggestedContent: "Practical guidance for successfully implementing these changes in your daily work routine.",
        contentType: "communication-tip",
        required: false,
        estimatedTime: 10
      }
    ],
    enabledFeatures: {
      quizzes: true,
      progressTracking: true,
      certificates: false,
      bookmarks: true,
      patientCareRationales: true,
      scenarioBasedQuestions: true,
      communicationSnippets: true,
      redFlagIdentifiers: true
    }
  },
  {
    id: "healthcare-communication-excellence",
    name: "Patient Communication Excellence",
    description: "Advanced communication skills for exceptional patient experiences",
    category: "communication",
    icon: "MessageCircle",
    color: "from-purple-600 to-pink-600",
    sections: [
      {
        id: "communication-foundations",
        title: "Communication Foundations",
        description: "Core principles of effective patient communication",
        suggestedContent: "Build strong communication skills that create positive patient experiences and improve care outcomes.",
        contentType: "text",
        required: true,
        estimatedTime: 12
      },
      {
        id: "difficult-conversations",
        title: "Challenging Situations",
        description: "Handling difficult conversations with empathy",
        suggestedContent: "Learn techniques for managing challenging patient interactions while maintaining professionalism and compassion.",
        contentType: "scenario",
        required: true,
        estimatedTime: 20
      },
      {
        id: "cultural-sensitivity",
        title: "Cultural Awareness",
        description: "Providing culturally sensitive patient care",
        suggestedContent: "Develop cultural competency to serve diverse patient populations with respect and understanding.",
        contentType: "text",
        required: true,
        estimatedTime: 15
      },
      {
        id: "communication-practice",
        title: "Practice Sessions",
        description: "Role-playing exercises for skill development",
        suggestedContent: "Interactive practice sessions to refine your communication skills in realistic healthcare scenarios.",
        contentType: "scenario",
        required: true,
        estimatedTime: 25
      }
    ],
    enabledFeatures: {
      quizzes: true,
      progressTracking: true,
      certificates: true,
      bookmarks: true,
      patientCareRationales: false,
      scenarioBasedQuestions: true,
      communicationSnippets: true,
      redFlagIdentifiers: false
    }
  }
];
