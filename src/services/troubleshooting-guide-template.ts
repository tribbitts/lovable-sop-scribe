
import { SopDocument } from "@/types/sop";

export const createTroubleshootingGuideSOP = (): SopDocument => {
  return {
    id: crypto.randomUUID(),
    title: "Troubleshooting Guide",
    topic: "Technical Support",
    description: "A guide to quickly resolve common issues and problems",
    companyName: "",
    date: new Date().toISOString().split('T')[0],
    logo: null,
    steps: [
      {
        id: crypto.randomUUID(),
        title: "Problem Identification",
        description: "How to identify and categorize issues",
        detailedInstructions: "Follow these steps to properly identify and categorize the problem.",
        estimatedTime: 5,
        completed: false,
        tags: ["troubleshooting", "problem-solving", "technical"],
        trainingMode: true,
        screenshot: null
      }
    ],
    tableOfContents: true,
    darkMode: false,
    trainingMode: true
  };
};
