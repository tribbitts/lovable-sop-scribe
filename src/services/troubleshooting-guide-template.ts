import { SopDocument } from "@/types/sop";

export const createTroubleshootingGuide = (): SopDocument => {
  return {
    id: crypto.randomUUID(),
    title: "Troubleshooting Guide Template",
    topic: "Technical Support",
    description: "Step-by-step troubleshooting guide for common issues",
    companyName: "",
    date: new Date().toISOString().split('T')[0],
    logo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: crypto.randomUUID(),
        title: "Problem Identification",
        description: "Identify and categorize the issue",
        detailedInstructions: "Follow these steps to properly identify the problem before attempting solutions.",
        estimatedTime: 5,
        completed: false,
        tags: ["troubleshooting", "diagnosis", "technical"],
        trainingMode: true,
        screenshot: null,
        resources: [],
        order: 0,
      }
    ],
    tableOfContents: true,
    darkMode: false,
    trainingMode: true
  };
};
