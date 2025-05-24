
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, HelpCircle, Users, Target, ArrowRight } from "lucide-react";

interface LessonTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateType: "standard" | "knowledge-check" | "scenario" | "resource-focus") => void;
}

export const LessonTemplateModal: React.FC<LessonTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const lessonTemplates = [
    {
      type: "standard" as const,
      title: "Standard Lesson",
      description: "Text + screenshot format for step-by-step instructions",
      icon: BookOpen,
      color: "from-blue-600 to-purple-600",
      features: ["Text instructions", "Screenshot support", "Callout tools"]
    },
    {
      type: "knowledge-check" as const,
      title: "Knowledge Check",
      description: "Test understanding with quiz questions and feedback",
      icon: HelpCircle,
      color: "from-green-600 to-teal-600",
      features: ["Quiz questions", "Immediate feedback", "Progress tracking"]
    },
    {
      type: "scenario" as const,
      title: "Real-World Scenario",
      description: "Apply concepts through practical examples and case studies",
      icon: Users,
      color: "from-orange-600 to-red-600",
      features: ["Practical examples", "Case studies", "Context application"]
    },
    {
      type: "resource-focus" as const,
      title: "Resource Hub",
      description: "Curated links and additional materials for deeper learning",
      icon: Target,
      color: "from-purple-600 to-pink-600",
      features: ["External links", "Downloadable resources", "Extended learning"]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#1E1E1E] rounded-2xl border border-zinc-800 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Choose a Lesson Template</h3>
              <p className="text-zinc-400">Select the best structure for your content to maximize learning effectiveness</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {lessonTemplates.map((template) => (
                <motion.div
                  key={template.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 cursor-pointer hover:border-purple-600/50 hover:bg-zinc-800/80 transition-all group"
                  onClick={() => onSelectTemplate(template.type)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <template.icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                        {template.title}
                      </h4>
                      <p className="text-sm text-zinc-400 mb-3">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-zinc-700/50 rounded text-zinc-300">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                💡 Tip: You can always change the structure after creating the lesson
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => onSelectTemplate("standard")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Skip & Create Basic Lesson
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
