
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Shield, CheckCircle } from "lucide-react";
import { HealthcareTemplate } from "@/types/healthcare-templates";
import { HealthcareTemplateService } from "@/services/healthcare-template-service";

interface HealthcareTemplateIntegrationProps {
  template: HealthcareTemplate;
  onApplyTemplate: (templateId: string) => void;
  onCancel: () => void;
}

export const HealthcareTemplateIntegration: React.FC<HealthcareTemplateIntegrationProps> = ({
  template,
  onApplyTemplate,
  onCancel
}) => {
  const totalTime = template.sections.reduce((acc, section) => acc + (section.estimatedTime || 0), 0);
  const requiredSections = template.sections.filter(section => section.required).length;

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "quizzes": return CheckCircle;
      case "progressTracking": return BookOpen;
      case "communicationSnippets": return Users;
      case "redFlagIdentifiers": return Shield;
      default: return CheckCircle;
    }
  };

  const enabledFeatures = Object.entries(template.enabledFeatures)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#1E1E1E] rounded-2xl border border-zinc-800 p-6 max-w-4xl mx-auto"
    >
      <div className="text-center mb-6">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${template.color} flex items-center justify-center mx-auto mb-4`}>
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{template.name}</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">{template.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">Duration</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{totalTime} min</p>
          <p className="text-sm text-zinc-400">Estimated completion time</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-green-400" />
            <span className="text-white font-medium">Sections</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{template.sections.length}</p>
          <p className="text-sm text-zinc-400">{requiredSections} required</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-purple-400" />
            <span className="text-white font-medium">Features</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{enabledFeatures.length}</p>
          <p className="text-sm text-zinc-400">Enhanced capabilities</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Training Sections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {template.sections.map((section, index) => (
            <div key={section.id} className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium">{section.title}</h4>
                    {section.required && (
                      <Badge className="bg-red-600 text-white text-xs">Required</Badge>
                    )}
                    {section.contentType === "safety-note" && (
                      <Badge className="bg-orange-600 text-white text-xs">Safety</Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">{section.description}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>⏱️ {section.estimatedTime || 10} min</span>
                    <span className="capitalize">📝 {section.contentType.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Enhanced Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {enabledFeatures.map((feature) => {
            const Icon = getFeatureIcon(feature);
            const featureLabels = {
              quizzes: "Knowledge Checks",
              progressTracking: "Progress Tracking",
              certificates: "Certificates",
              bookmarks: "Bookmarks",
              patientCareRationales: "Care Rationales",
              scenarioBasedQuestions: "Scenarios",
              communicationSnippets: "Communication Tips",
              redFlagIdentifiers: "Red Flag Alerts"
            };
            
            return (
              <div key={feature} className="bg-zinc-800/30 rounded-lg p-3 text-center">
                <Icon className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-white font-medium">{featureLabels[feature] || feature}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-zinc-700">
        <div className="text-sm text-zinc-400">
          💡 This template includes healthcare-specific content and interactive elements optimized for patient care training
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Back to Templates
          </Button>
          <Button
            onClick={() => onApplyTemplate(template.id)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Create Training Module
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
