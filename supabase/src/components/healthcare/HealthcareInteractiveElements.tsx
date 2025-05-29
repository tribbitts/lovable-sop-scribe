
import React from "react";
import { RedFlagIdentifier } from "./RedFlagIdentifier";
import { GuidedClickThrough } from "./GuidedClickThrough";
import { PatientCommunicationSnippets } from "./PatientCommunicationSnippets";
import { HealthcareContent } from "@/types/sop";

interface HealthcareInteractiveElementsProps {
  content: HealthcareContent[];
  screenshotUrl?: string;
  className?: string;
}

export const HealthcareInteractiveElements: React.FC<HealthcareInteractiveElementsProps> = ({
  content,
  screenshotUrl,
  className = ""
}) => {
  // Generate guided steps from screenshot if available
  const generateGuidedSteps = () => {
    if (!screenshotUrl) return [];
    
    // Example guided steps - in a real implementation, these would be generated
    // based on the content type and healthcare context
    return [
      {
        id: "step-1",
        x: 20,
        y: 30,
        title: "Verify Patient Identity",
        description: "Always confirm patient name and date of birth before proceeding",
        action: "click" as const,
        duration: 3000,
        criticalPoint: true
      },
      {
        id: "step-2", 
        x: 50,
        y: 45,
        title: "Check Allergy Information",
        description: "Review current allergies and medications for safety",
        action: "hover" as const,
        duration: 2500,
        criticalPoint: true
      },
      {
        id: "step-3",
        x: 80,
        y: 60,
        title: "Document Interaction",
        description: "Record all relevant information in patient record",
        action: "type" as const,
        duration: 2000
      }
    ];
  };

  const guidedSteps = generateGuidedSteps();

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Red Flag Identifier for each content item */}
      {content.map((item) => (
        <div key={item.id}>
          {item.type === "critical-safety" || item.type === "hipaa-alert" ? (
            <RedFlagIdentifier 
              content={item.content}
              className="mb-4"
            />
          ) : (
            <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700">
              <RedFlagIdentifier content={item.content} />
            </div>
          )}
        </div>
      ))}

      {/* Guided Click-Through if screenshot is available */}
      {screenshotUrl && guidedSteps.length > 0 && (
        <GuidedClickThrough
          imageUrl={screenshotUrl}
          steps={guidedSteps}
          title="Interactive Workflow Training"
          onComplete={() => {
            console.log("✅ Guided training completed successfully!");
          }}
        />
      )}

      {/* Patient Communication Snippets */}
      <PatientCommunicationSnippets 
        category="all"
        className="mt-8"
      />
    </div>
  );
};
