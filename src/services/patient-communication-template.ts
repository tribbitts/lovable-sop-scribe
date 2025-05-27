
import { SopDocument, SopStep } from "@/types/sop";

export interface PatientCommunicationTemplate {
  id: string;
  title: string;
  description: string;
  steps: Partial<SopStep>[];
}

export const patientCommunicationProtocolTemplate: PatientCommunicationTemplate = {
  id: "patient-communication-protocol",
  title: "Patient Communication Protocol",
  description: "Comprehensive template for effective patient communication, including empathy techniques, difficult conversation management, and scenario-based training.",
  steps: [
    {
      title: "Initial Patient Greeting & Assessment",
      description: "Establish rapport and conduct initial assessment with empathy and professionalism.",
      detailedInstructions: "Use warm, welcoming tone while maintaining professional boundaries. Begin with open-ended questions to understand patient concerns.",
      healthcareContent: [
        {
          id: "greeting-protocol",
          type: "patient-communication",
          content: "Always introduce yourself with your name and role. Make eye contact, use a calm tone, and allow the patient to express their primary concern without interruption.",
          priority: "high",
          icon: "👋"
        },
        {
          id: "empathy-technique",
          type: "patient-communication", 
          content: "Practice active listening: 'I can see this is concerning for you' or 'Help me understand how you're feeling about this.'",
          priority: "high",
          icon: "💝"
        }
      ],
      quizQuestions: [
        {
          id: "greeting-quiz",
          question: "What is the MOST important element when greeting a patient for the first time?",
          type: "multiple-choice",
          options: [
            "Making eye contact and introducing yourself clearly",
            "Immediately asking about their symptoms",
            "Checking their insurance information",
            "Explaining hospital policies"
          ],
          correctAnswer: "Making eye contact and introducing yourself clearly",
          explanation: "First impressions matter greatly in healthcare. Clear introduction with eye contact builds trust and rapport.",
          itmOnly: true
        }
      ],
      itmOnlyContent: {
        detailedRationale: "Patient communication sets the tone for the entire healthcare experience. Research shows that effective initial communication reduces anxiety, improves compliance, and decreases complaints. The greeting phase is crucial for establishing psychological safety.",
        interactiveScenarios: [
          "Practice greeting an anxious first-time patient",
          "Handle greeting when running behind schedule",
          "Communicate with a patient who speaks limited English"
        ]
      }
    },
    {
      title: "Active Listening & Empathy Techniques",
      description: "Deploy advanced listening skills and empathy techniques to understand patient perspectives.",
      detailedInstructions: "Use reflective listening, validate emotions, and demonstrate genuine concern for patient wellbeing.",
      healthcareContent: [
        {
          id: "active-listening",
          type: "patient-communication",
          content: "LISTEN technique: Look interested, Inquire with open questions, Summarize what you heard, Take notes, Empathize, Never interrupt.",
          priority: "high",
          icon: "👂"
        },
        {
          id: "validation-phrases",
          type: "patient-communication",
          content: "Validation phrases: 'That sounds really difficult', 'I can understand why you'd feel that way', 'Your concerns are completely valid'.",
          priority: "medium",
          icon: "✅"
        }
      ],
      quizQuestions: [
        {
          id: "empathy-quiz",
          question: "A patient says 'I'm scared about my surgery tomorrow.' What is the BEST empathetic response?",
          type: "multiple-choice",
          options: [
            "Don't worry, everything will be fine",
            "I understand you're feeling scared. Can you tell me what specifically worries you most?",
            "The surgeon is very experienced",
            "Many patients feel this way"
          ],
          correctAnswer: "I understand you're feeling scared. Can you tell me what specifically worries you most?",
          explanation: "This response validates the emotion and invites the patient to share more, showing genuine interest in their specific concerns.",
          itmOnly: true
        }
      ]
    },
    {
      title: "Delivering Difficult News",
      description: "Navigate challenging conversations with compassion and clarity while maintaining professional support.",
      detailedInstructions: "Use SPIKES protocol: Setting, Perception, Invitation, Knowledge, Emotions, Strategy/Summary.",
      healthcareContent: [
        {
          id: "spikes-protocol",
          type: "critical-safety",
          content: "SPIKES Protocol: 1) Secure private setting, 2) Assess patient's perception, 3) Ask permission to share info, 4) Share knowledge clearly, 5) Address emotions, 6) Develop strategy together.",
          priority: "high",
          icon: "🎯"
        },
        {
          id: "difficult-news-phrases",
          type: "patient-communication",
          content: "Helpful phrases: 'I wish I had better news', 'This must be overwhelming', 'Let's talk about what this means for you', 'What questions do you have?'",
          priority: "high",
          icon: "💬"
        }
      ],
      patientSafetyNote: "Always ensure patient has support person present when delivering serious news. Provide written information and follow-up resources.",
      quizQuestions: [
        {
          id: "difficult-news-quiz",
          question: "When delivering difficult news, what should you do FIRST?",
          type: "multiple-choice",
          options: [
            "Get straight to the point to avoid prolonging anxiety",
            "Ensure you're in a private, comfortable setting",
            "Ask if they want family present",
            "Explain all treatment options"
          ],
          correctAnswer: "Ensure you're in a private, comfortable setting",
          explanation: "Setting the right environment is crucial for difficult conversations. Privacy and comfort help patients process information better.",
          itmOnly: true
        }
      ]
    },
    {
      title: "Cultural Sensitivity & Language Barriers",
      description: "Adapt communication approaches for diverse cultural backgrounds and language differences.",
      healthcareContent: [
        {
          id: "cultural-awareness",
          type: "patient-communication",
          content: "Be aware of cultural differences in eye contact, personal space, family involvement in decisions, and religious considerations. Ask open-ended questions about preferences.",
          priority: "high",
          icon: "🌍"
        },
        {
          id: "interpreter-services",
          type: "standard",
          content: "Always use professional interpreter services, not family members, for medical translation. Speak directly to the patient, not the interpreter.",
          priority: "high",
          icon: "🗣️"
        }
      ],
      quizQuestions: [
        {
          id: "cultural-sensitivity-quiz",
          question: "When working with a patient who needs interpretation services, you should:",
          type: "multiple-choice",
          options: [
            "Ask a family member to translate to save time",
            "Use professional interpreter services and speak directly to the patient",
            "Speak louder and slower in English",
            "Use medical terminology since interpreters know it"
          ],
          correctAnswer: "Use professional interpreter services and speak directly to the patient",
          explanation: "Professional interpreters ensure accuracy and maintain patient confidentiality. Family members may filter or misinterpret information.",
          itmOnly: true
        }
      ]
    },
    {
      title: "De-escalation & Conflict Resolution",
      description: "Manage tense situations and upset patients with professional de-escalation techniques.",
      healthcareContent: [
        {
          id: "deescalation-steps",
          type: "critical-safety",
          content: "De-escalation steps: 1) Stay calm and lower your voice, 2) Listen without defending, 3) Acknowledge their feelings, 4) Ask what would help, 5) Find common ground, 6) Involve supervisor if needed.",
          priority: "high",
          icon: "🤝"
        },
        {
          id: "upset-patient-phrases",
          type: "patient-communication",
          content: "Calming phrases: 'I can see you're upset', 'Let me help you with this', 'I want to understand your concern', 'What can we do to make this better?'",
          priority: "medium",
          icon: "😌"
        }
      ],
      patientSafetyNote: "If a patient becomes aggressive or threatening, immediately call security and document the incident. Your safety comes first.",
      itmOnlyContent: {
        interactiveScenarios: [
          "Handle a patient angry about wait times",
          "Manage family upset about treatment delays",
          "De-escalate insurance coverage disputes"
        ]
      }
    }
  ]
};

export const createPatientCommunicationSOP = (companyName: string = "Healthcare Organization"): SopDocument => {
  const template = patientCommunicationProtocolTemplate;
  
  return {
    title: template.title,
    topic: "Healthcare Communication",
    date: new Date().toLocaleDateString(),
    description: template.description,
    logo: null,
    steps: template.steps.map((step, index) => ({
      id: `step-${index + 1}`,
      title: step.title || `Step ${index + 1}`,
      description: step.description || "",
      detailedInstructions: step.detailedInstructions,
      screenshot: null,
      completed: false,
      trainingMode: true,
      healthcareContent: step.healthcareContent || [],
      patientSafetyNote: step.patientSafetyNote,
      quizQuestions: step.quizQuestions || [],
      itmOnlyContent: step.itmOnlyContent,
      estimatedTime: 8 // 8 minutes per communication step
    })) as SopStep[],
    companyName,
    trainingMode: true,
    healthcareMetadata: {
      revisionHistory: [{
        id: "v1",
        version: "1.0",
        date: new Date().toLocaleDateString(),
        changes: "Initial patient communication protocol template",
        author: "SOPify Healthcare Team",
        approved: true,
        approver: "Clinical Director",
        approvalDate: new Date().toLocaleDateString()
      }],
      approvalSignatures: [],
      complianceLevel: "hipaa",
      patientImpact: "direct",
      criticalityLevel: "critical"
    }
  };
};
