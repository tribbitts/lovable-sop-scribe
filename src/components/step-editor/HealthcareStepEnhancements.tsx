
import React from "react";
import { SopStep } from "@/types/sop";
import { HealthcareInteractiveElements } from "../healthcare/HealthcareInteractiveElements";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Users, MessageCircle } from "lucide-react";

interface HealthcareStepEnhancementsProps {
  step: SopStep;
  className?: string;
}

export const HealthcareStepEnhancements: React.FC<HealthcareStepEnhancementsProps> = ({
  step,
  className = ""
}) => {
  // Only show healthcare enhancements if the step has healthcare content
  if (!step.healthcareContent || step.healthcareContent.length === 0) {
    return null;
  }

  const criticalContent = step.healthcareContent.filter(content => 
    content.priority === "high" || content.type === "critical-safety"
  );

  const communicationContent = step.healthcareContent.filter(content =>
    content.type === "patient-communication"
  );

  const hasInteractiveElements = step.screenshot?.dataUrl || step.healthcareContent.length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Critical Safety Alerts */}
      {criticalContent.length > 0 && (
        <Card className="bg-red-900/20 border-red-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h4 className="font-semibold text-red-400">Critical Safety Information</h4>
              <Badge className="bg-red-600 text-white text-xs">
                High Priority
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalContent.map((content) => (
                <div key={content.id} className="p-3 bg-red-950/30 rounded-lg border border-red-800/50">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-100 text-sm leading-relaxed">{content.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Communication Guidelines */}
      {communicationContent.length > 0 && (
        <Card className="bg-blue-900/20 border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-400" />
              <h4 className="font-semibold text-blue-400">Communication Guidelines</h4>
              <Badge className="bg-blue-600 text-white text-xs">
                Best Practices
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {communicationContent.map((content) => (
                <div key={content.id} className="p-3 bg-blue-950/30 rounded-lg border border-blue-800/50">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-100 text-sm leading-relaxed">{content.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Healthcare Elements */}
      {hasInteractiveElements && (
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <h4 className="font-semibold text-purple-400">Interactive Training Elements</h4>
              <Badge className="bg-purple-600 text-white text-xs">
                Enhanced Learning
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <HealthcareInteractiveElements
              content={step.healthcareContent}
              screenshotUrl={step.screenshot?.dataUrl}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
