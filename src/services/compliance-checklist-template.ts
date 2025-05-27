
import { SopDocument } from "@/types/sop";

export const createComplianceChecklistSOP = (): SopDocument => {
  return {
    id: crypto.randomUUID(),
    title: "Compliance Checklist",
    topic: "Regulatory Compliance",
    description: "A detailed checklist to ensure compliance with industry regulations",
    companyName: "",
    date: new Date().toISOString().split('T')[0],
    steps: [
      {
        id: crypto.randomUUID(),
        title: "Regulatory Requirements",
        description: "Key compliance items to verify",
        detailedInstructions: "Review and verify all regulatory requirements are met.",
        estimatedTime: "15 minutes",
        completed: false,
        tags: ["compliance", "regulatory", "checklist"],
        trainingMode: {
          isEnabled: true,
          type: "standard"
        }
      }
    ],
    tableOfContents: [],
    darkMode: false,
    trainingMode: true
  };
};
