
import { SopDocument } from "@/types/sop";

export const createBasicSOP = (): SopDocument => {
  return {
    title: "Basic SOP Template",
    topic: "Standard Operating Procedure",
    description: "A simple, step-by-step guide for standard operating procedures",
    companyName: "",
    date: new Date().toISOString().split('T')[0],
    logo: null,
    steps: [
      {
        id: crypto.randomUUID(),
        title: "Introduction",
        description: "Overview of the procedure",
        detailedInstructions: "Provide an introduction to what this SOP covers and its purpose.",
        estimatedTime: 5,
        completed: false,
        tags: ["introduction", "overview"],
        trainingMode: true,
        screenshot: null
      }
    ],
    tableOfContents: true,
    darkMode: false,
    trainingMode: true
  };
};
