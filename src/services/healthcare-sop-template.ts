
import { SopDocument } from "@/types/sop";

export const createHealthcareSOP = (): SopDocument => {
  return {
    title: "Healthcare SOP Template",
    topic: "Healthcare Procedures",
    description: "A specialized SOP for healthcare procedures with compliance and safety guidelines",
    companyName: "",
    date: new Date().toISOString().split('T')[0],
    logo: null,
    steps: [
      {
        id: crypto.randomUUID(),
        title: "Safety Protocols",
        description: "Essential safety measures and compliance requirements",
        detailedInstructions: "Review all safety protocols and compliance requirements before proceeding.",
        estimatedTime: 10,
        completed: false,
        tags: ["safety", "compliance", "healthcare"],
        trainingMode: true,
        screenshot: null,
        healthcareContent: [
          {
            id: crypto.randomUUID(),
            type: "critical-safety",
            content: "Hand hygiene protocols must be followed",
            priority: "high"
          },
          {
            id: crypto.randomUUID(),
            type: "hipaa-alert",
            content: "HIPAA compliance required for all patient interactions",
            priority: "high"
          }
        ]
      }
    ],
    tableOfContents: true,
    darkMode: false,
    trainingMode: true
  };
};
