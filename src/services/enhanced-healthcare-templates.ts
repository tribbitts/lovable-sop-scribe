import { SopDocument, SopStep, HealthcareContent } from "@/types/sop";
import { v4 as uuidv4 } from "uuid";

// Enhanced theme configurations for different healthcare templates
export interface HealthcareTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  iconStyle: string;
  features: {
    criticalAlerts: boolean;
    complianceTracking: boolean;
    scenarioBasedLearning: boolean;
    communicationTools: boolean;
    safetyProtocols: boolean;
    progressCertification: boolean;
  };
}

export const healthcareThemes: Record<string, HealthcareTheme> = {
  "new-hire-onboarding": {
    id: "new-hire-onboarding",
    name: "New Hire Onboarding",
    primaryColor: "#007AFF", // Professional blue
    secondaryColor: "#5856D6", // Purple accent
    accentColor: "#34C759", // Success green
    backgroundColor: "#F2F7FF", // Light blue background
    textColor: "#1D1D1F", // Dark text
    iconStyle: "professional",
    features: {
      criticalAlerts: true,
      complianceTracking: true,
      scenarioBasedLearning: true,
      communicationTools: true,
      safetyProtocols: true,
      progressCertification: true
    }
  },
  "continued-learning": {
    id: "continued-learning",
    name: "Continued Learning",
    primaryColor: "#10B981", // Emerald green
    secondaryColor: "#059669", // Darker green
    accentColor: "#F59E0B", // Amber accent
    backgroundColor: "#F0FDF4", // Light green background
    textColor: "#064E3B", // Dark green text
    iconStyle: "growth",
    features: {
      criticalAlerts: false,
      complianceTracking: true,
      scenarioBasedLearning: true,
      communicationTools: false,
      safetyProtocols: false,
      progressCertification: false
    }
  },
  "communication-excellence": {
    id: "communication-excellence",
    name: "Communication Excellence",
    primaryColor: "#8B5CF6", // Purple
    secondaryColor: "#EC4899", // Pink accent
    accentColor: "#06B6D4", // Cyan accent
    backgroundColor: "#FAF5FF", // Light purple background
    textColor: "#581C87", // Dark purple text
    iconStyle: "communication",
    features: {
      criticalAlerts: false,
      complianceTracking: false,
      scenarioBasedLearning: true,
      communicationTools: true,
      safetyProtocols: false,
      progressCertification: true
    }
  },
  "patient-communication": {
    id: "patient-communication",
    name: "Patient Communication Protocol",
    primaryColor: "#EF4444", // Red for urgency/importance
    secondaryColor: "#F97316", // Orange accent
    accentColor: "#22C55E", // Green for positive outcomes
    backgroundColor: "#FEF2F2", // Light red background
    textColor: "#7F1D1D", // Dark red text
    iconStyle: "medical",
    features: {
      criticalAlerts: true,
      complianceTracking: true,
      scenarioBasedLearning: true,
      communicationTools: true,
      safetyProtocols: true,
      progressCertification: true
    }
  },
  "safety-protocols": {
    id: "safety-protocols",
    name: "Safety Protocols",
    primaryColor: "#DC2626", // Strong red
    secondaryColor: "#B91C1C", // Darker red
    accentColor: "#FBBF24", // Warning yellow
    backgroundColor: "#FEF2F2", // Light red background
    textColor: "#7F1D1D", // Dark red text
    iconStyle: "safety",
    features: {
      criticalAlerts: true,
      complianceTracking: true,
      scenarioBasedLearning: false,
      communicationTools: false,
      safetyProtocols: true,
      progressCertification: true
    }
  },
  "compliance-training": {
    id: "compliance-training",
    name: "Compliance Training",
    primaryColor: "#1F2937", // Dark gray
    secondaryColor: "#374151", // Medium gray
    accentColor: "#3B82F6", // Blue accent
    backgroundColor: "#F9FAFB", // Light gray background
    textColor: "#111827", // Very dark text
    iconStyle: "legal",
    features: {
      criticalAlerts: true,
      complianceTracking: true,
      scenarioBasedLearning: false,
      communicationTools: false,
      safetyProtocols: true,
      progressCertification: true
    }
  }
};

// Enhanced template creation functions
export function createNewHireOnboardingSOP(): SopDocument {
  const theme = healthcareThemes["new-hire-onboarding"];
  
  return {
    title: "Healthcare New Hire Onboarding",
    topic: "Comprehensive onboarding for new healthcare staff",
    date: new Date().toLocaleDateString(),
    description: "Complete orientation program covering patient care principles, systems navigation, and compliance requirements",
    logo: null,
    backgroundImage: null,
    companyName: "Your Healthcare Organization",
    tableOfContents: true,
    darkMode: false,
    trainingMode: true,
    progressTracking: {
      enabled: true,
      sessionName: "New Hire Orientation",
      lastSaved: new Date().toISOString()
    },
    steps: [
      {
        id: uuidv4(),
        title: "Welcome to Our Healthcare Team",
        description: "Introduction to our organization's mission, values, and patient-centered approach to care.",
        detailedInstructions: "Welcome to our healthcare organization! This comprehensive orientation will introduce you to our core values, patient-first philosophy, and the essential knowledge you need to excel in your role. Take time to understand how every position contributes to excellent patient care.",
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: 15,
        tags: ["orientation", "values", "patient-care"],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 80,
        healthcareContent: [
          {
            id: uuidv4(),
            type: "standard",
            content: "Our organization is committed to providing exceptional patient care through teamwork, compassion, and clinical excellence.",
            priority: "high"
          }
        ],
        quizQuestions: [
          {
            id: uuidv4(),
            question: "What is the primary focus of our healthcare organization?",
            type: "multiple-choice",
            options: ["Efficiency above all", "Patient-centered care", "Cost reduction", "Technology advancement"],
            correctAnswer: "Patient-centered care",
            explanation: "Our organization prioritizes patient-centered care, ensuring that all decisions are made with the patient's best interest in mind."
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Patient-First Philosophy",
        description: "Understanding how our patient-first approach guides every decision and interaction.",
        detailedInstructions: "Learn about our patient-first philosophy that influences every aspect of our operations. This principle guides how we interact with patients, families, and each other, ensuring that patient needs and safety are always our top priority.",
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: 20,
        tags: ["patient-care", "philosophy", "values"],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 85,
        healthcareContent: [
          {
            id: uuidv4(),
            type: "patient-communication",
            content: "💬 Sample phrases: 'How can I help you today?' | 'Let me make sure I understand your concern.' | 'I'll get that information for you right away.'",
            priority: "medium"
          }
        ]
      },
      {
        id: uuidv4(),
        title: "HIPAA & Privacy Compliance",
        description: "Critical privacy requirements and your legal obligations regarding patient information.",
        detailedInstructions: "CRITICAL TRAINING: Understand your legal obligations regarding patient privacy and HIPAA compliance. This is not optional - all healthcare staff must maintain strict confidentiality and follow proper procedures for handling patient information.",
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: 25,
        tags: ["hipaa", "privacy", "compliance", "critical"],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 95,
        healthcareContent: [
          {
            id: uuidv4(),
            type: "critical-safety",
            content: "🚨 CRITICAL: HIPAA violations can result in fines up to $1.5 million and criminal charges. Never share patient information inappropriately.",
            priority: "high"
          },
          {
            id: uuidv4(),
            type: "hipaa-alert",
            content: "All patient information accessed through our systems is protected under HIPAA. Only access information necessary for your job duties.",
            priority: "high"
          }
        ],
        quizQuestions: [
          {
            id: uuidv4(),
            question: "What is the maximum penalty for willful HIPAA violations?",
            type: "multiple-choice",
            options: ["$100,000 fine", "$1.5 million fine and 10 years imprisonment", "$50,000 fine", "Job termination only"],
            correctAnswer: "$1.5 million fine and 10 years imprisonment",
            explanation: "HIPAA violations can result in severe penalties including substantial fines and criminal charges."
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Emergency Protocols",
        description: "Essential emergency procedures and escalation paths for patient safety.",
        detailedInstructions: "CRITICAL: Know the emergency procedures and escalation paths. In healthcare settings, quick and appropriate responses can be life-saving. Familiarize yourself with emergency codes, contact procedures, and your role during emergencies.",
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: 20,
        tags: ["emergency", "safety", "protocols", "critical"],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 90,
        healthcareContent: [
          {
            id: uuidv4(),
            type: "critical-safety",
            content: "🚨 CRITICAL: In medical emergencies, immediately call 911 and notify the charge nurse. Every second counts in emergency situations.",
            priority: "high"
          }
        ]
      }
    ],
    healthcareMetadata: {
      revisionHistory: [
        {
          id: uuidv4(),
          version: "1.0",
          date: new Date().toLocaleDateString(),
          changes: "Initial creation of new hire onboarding program",
          author: "Training Department",
          approved: true,
          approver: "Chief Nursing Officer",
          approvalDate: new Date().toLocaleDateString()
        }
      ],
      approvalSignatures: [],
      complianceLevel: "hipaa",
      patientImpact: "direct",
      criticalityLevel: "critical"
    }
  };
}

export function createContinuedLearningSOP(): SopDocument {
  const theme = healthcareThemes["continued-learning"];
  
  return {
    title: "Healthcare Continued Learning Update",
    topic: "Professional development and skill enhancement",
    date: new Date().toLocaleDateString(),
    description: "Ongoing education program for experienced healthcare professionals to stay current with best practices",
    logo: null,
    backgroundImage: null,
    companyName: "Your Healthcare Organization",
    tableOfContents: true,
    darkMode: false,
    trainingMode: true,
    progressTracking: {
      enabled: true,
      sessionName: "Continued Learning Module",
      lastSaved: new Date().toISOString()
    },
    steps: [
      {
        id: uuidv4(),
        title: "Training Update Overview",
        description: "Understanding the purpose and importance of this professional development update.",
        detailedInstructions: "This update covers important changes and improvements designed to enhance patient care quality and operational efficiency. Focus on how these updates will improve your daily workflow and patient interactions.",
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: 10,
        tags: ["overview", "professional-development", "updates"],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 75
      },
      {
        id: uuidv4(),
        title: "Evidence-Based Practice Updates",
        description: "Latest research findings and how they impact our care protocols.",
        detailedInstructions: "Review the latest evidence-based practices that have been integrated into our care protocols. Understand the research behind these changes and how they improve patient outcomes.",
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: 25,
        tags: ["evidence-based", "research", "protocols"],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 80,
        healthcareContent: [
          {
            id: uuidv4(),
            type: "scenario-guidance",
            content: "🎯 Practice Tip: Consider how these evidence-based changes will affect your daily patient interactions and care delivery.",
            priority: "medium"
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Quality Improvement Initiatives",
        description: "New quality measures and improvement strategies being implemented.",
        detailedInstructions: "Learn about our latest quality improvement initiatives and your role in achieving better patient outcomes. These initiatives are based on data analysis and best practice recommendations.",
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: 20,
        tags: ["quality", "improvement", "outcomes"],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 80
      }
    ],
    healthcareMetadata: {
      revisionHistory: [
        {
          id: uuidv4(),
          version: "2.1",
          date: new Date().toLocaleDateString(),
          changes: "Updated with latest evidence-based practice guidelines",
          author: "Clinical Education Team",
          approved: true,
          approver: "Medical Director",
          approvalDate: new Date().toLocaleDateString()
        }
      ],
      approvalSignatures: [],
      complianceLevel: "basic",
      patientImpact: "indirect",
      criticalityLevel: "important"
    }
  };
}

export function createCommunicationExcellenceSOP(): SopDocument {
  const theme = healthcareThemes["communication-excellence"];
  
  return {
    title: "Patient Communication Excellence",
    topic: "Advanced communication skills for exceptional patient experiences",
    date: new Date().toLocaleDateString(),
    description: "Comprehensive training on therapeutic communication, empathy, and patient engagement techniques",
    logo: null,
    backgroundImage: null,
    companyName: "Your Healthcare Organization",
    tableOfContents: true,
    darkMode: false,
    trainingMode: true,
    progressTracking: {
      enabled: true,
      sessionName: "Communication Excellence Training",
      lastSaved: new Date().toISOString()
    },
    steps: [
      {
        id: uuidv4(),
        title: "Therapeutic Communication Foundations",
        description: "Core principles of effective therapeutic communication in healthcare settings.",
        detailedInstructions: "Master the fundamental principles of therapeutic communication that build trust, reduce anxiety, and improve health outcomes. Learn active listening techniques, empathetic responses, and professional boundary setting.",
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: 20,
        tags: ["communication", "therapeutic", "empathy"],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 85,
        healthcareContent: [
          {
            id: uuidv4(),
            type: "patient-communication",
            content: "💬 Therapeutic phrases: 'I can see this is concerning for you.' | 'Help me understand what you're experiencing.' | 'Your feelings about this are completely valid.'",
            priority: "high"
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Difficult Conversations & De-escalation",
        description: "Managing challenging patient interactions with professionalism and empathy.",
        detailedInstructions: "Develop advanced skills for handling difficult conversations, managing upset patients and families, and de-escalating tense situations while maintaining therapeutic relationships and achieving positive outcomes.",
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: 30,
        tags: ["de-escalation", "difficult-conversations", "conflict-resolution"],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 90,
        healthcareContent: [
          {
            id: uuidv4(),
            type: "patient-communication",
            content: "💬 De-escalation phrases: 'I understand your frustration.' | 'Let me see how I can help resolve this.' | 'Your concerns are important to us, and I want to address them.'",
            priority: "high"
          },
          {
            id: uuidv4(),
            type: "scenario-guidance",
            content: "🎯 Scenario Practice: Role-play challenging situations to build confidence and develop effective response strategies.",
            priority: "medium"
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Cultural Competency & Sensitivity",
        description: "Providing culturally responsive care and communication across diverse populations.",
        detailedInstructions: "Build cultural competency to provide respectful, effective care to patients from diverse backgrounds. Learn about cultural factors that influence health beliefs, communication styles, and care preferences.",
        screenshot: null,
        screenshots: [],
        completed: false,
        estimatedTime: 25,
        tags: ["cultural-competency", "diversity", "inclusive-care"],
        trainingMode: true,
        allowRetakes: true,
        requiredScore: 85
      }
    ],
    healthcareMetadata: {
      revisionHistory: [
        {
          id: uuidv4(),
          version: "1.2",
          date: new Date().toLocaleDateString(),
          changes: "Enhanced cultural competency section with updated guidelines",
          author: "Patient Experience Team",
          approved: true,
          approver: "Chief Patient Officer",
          approvalDate: new Date().toLocaleDateString()
        }
      ],
      approvalSignatures: [],
      complianceLevel: "basic",
      patientImpact: "direct",
      criticalityLevel: "important"
    }
  };
}

// Export the creation functions
export const createHealthcareSOPByType = {
  "new-hire-onboarding": createNewHireOnboardingSOP,
  "continued-learning": createContinuedLearningSOP,
  "communication-excellence": createCommunicationExcellenceSOP
}; 