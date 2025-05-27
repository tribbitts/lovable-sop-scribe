
import { SopDocument } from "@/types/sop";

export const createComplianceChecklistSOP = (): SopDocument => {
  return {
    title: "Compliance Checklist",
    topic: "Regulatory Compliance",
    description: "A detailed checklist to ensure compliance with industry regulations",
    companyName: "",
    date: new Date().toISOString().split('T')[0],
    logo: null,
    steps: [
      {
        id: crypto.randomUUID(),
        title: "Regulatory Requirements",
        description: "Key compliance items to verify",
        detailedInstructions: "Review and verify all regulatory requirements are met.",
        estimatedTime: 15,
        completed: false,
        tags: ["compliance", "regulatory", "checklist"],
        trainingMode: true,
        screenshot: null
      }
    ],
    tableOfContents: true,
    darkMode: false,
    trainingMode: true
  };
};
