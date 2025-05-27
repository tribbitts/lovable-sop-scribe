
import { SopDocument } from "@/types/sop";

export const createTrainingModuleSOP = (): SopDocument => {
  return {
    id: crypto.randomUUID(),
    title: "Interactive Training Module",
    topic: "Training & Development",
    description: "An interactive training module with quizzes and progress tracking",
    companyName: "",
    date: new Date().toISOString().split('T')[0],
    steps: [
      {
        id: crypto.randomUUID(),
        title: "Learning Objectives",
        description: "What you'll learn in this module",
        detailedInstructions: "Define clear learning objectives for this training module.",
        estimatedTime: "3 minutes",
        completed: false,
        tags: ["objectives", "learning"],
        trainingMode: {
          isEnabled: true,
          type: "knowledge-check"
        },
        quizQuestions: [
          {
            id: crypto.randomUUID(),
            question: "What are the main objectives of this training?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: "This helps ensure understanding of the training goals."
          }
        ]
      }
    ],
    tableOfContents: [],
    darkMode: false,
    trainingMode: true
  };
};
