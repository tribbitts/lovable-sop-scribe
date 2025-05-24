import { SopDocument } from "@/types/sop";
import { toast } from "@/hooks/use-toast";

/**
 * Validates SOP document before export
 */
export const validateDocument = (sopDocument: SopDocument, isPro: boolean): boolean => {
  if (!validateTitle(sopDocument)) return false;
  if (!validateTopic(sopDocument)) return false;
  if (!validateSteps(sopDocument)) return false;
  
  // Verify Pro status for background image
  if (sopDocument.backgroundImage && !isPro) {
    showValidationError(
      "Pro Feature Required", 
      "Custom backgrounds are only available with a Pro subscription."
    );
    return false;
  }
  
  return true;
};

/**
 * Validates document title
 */
export const validateTitle = (sopDocument: SopDocument): boolean => {
  if (!sopDocument.title) {
    showValidationError("Training Module Title Required", "Please provide a title for your training module in the 'Training Module Information' section above.");
    return false;
  }
  return true;
};

/**
 * Validates document topic
 */
export const validateTopic = (sopDocument: SopDocument): boolean => {
  if (!sopDocument.topic) {
    showValidationError("Topic Required", "Please provide a topic/category for your training module in the 'Training Module Information' section above.");
    return false;
  }
  return true;
};

/**
 * Validates steps content
 */
export const validateSteps = (sopDocument: SopDocument): boolean => {
  // Validate that at least one step exists
  if (sopDocument.steps.length === 0) {
    showValidationError("No Lessons Found", "Please add at least one lesson to your training module.");
    return false;
  }

  // Validate that all steps have descriptions
  for (let i = 0; i < sopDocument.steps.length; i++) {
    const step = sopDocument.steps[i];
    if (!step.description) {
      showValidationError(
        "Lesson Description Required", 
        `Please provide a description for lesson ${i + 1}.`
      );
      return false;
    }
  }
  
  return true;
};

/**
 * Shows validation error toast
 */
export const showValidationError = (title: string, description: string) => {
  toast({
    title,
    description,
    variant: "destructive"
  });
};
