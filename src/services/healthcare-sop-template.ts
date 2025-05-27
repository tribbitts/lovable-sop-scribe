
import { SopDocument } from "@/types/sop";

export const createHealthcareSOP = (): SopDocument => {
  return {
    id: crypto.randomUUID(),
    title: "Healthcare SOP Template",
    topic: "Healthcare Procedures",
    description: "A specialized SOP for healthcare procedures with compliance and safety guidelines",
    companyName: "",
    date: new Date().toISOString().split('T')[0],
    steps: [
      {
        id: crypto.randomUUID(),
        title: "Safety Protocols",
        description: "Essential safety measures and compliance requirements",
        detailedInstructions: "Review all safety protocols and compliance requirements before proceeding.",
        estimatedTime: "10 minutes",
        completed: false,
        tags: ["safety", "compliance", "healthcare"],
        trainingMode: {
          isEnabled: true,
          type: "standard"
        },
        healthcareContent: {
          safetyProtocols: ["Hand hygiene", "PPE requirements", "Infection control"],
          complianceNotes: ["HIPAA compliance required", "Document all procedures"],
          patientSafetyTips: ["Verify patient identity", "Check allergies", "Follow medication protocols"]
        }
      }
    ],
    tableOfContents: [],
    darkMode: false,
    trainingMode: true
  };
};
