
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  ArrowRight, 
  MousePointer,
  Eye,
  Target
} from "lucide-react";

interface GuidedStep {
  id: string;
  x: number; // Percentage
  y: number; // Percentage
  title: string;
  description: string;
  action: "click" | "hover" | "scroll" | "type";
  duration?: number; // milliseconds
  criticalPoint?: boolean;
}

interface GuidedClickThroughProps {
  imageUrl: string;
  steps: GuidedStep[];
  title?: string;
  onComplete?: () => void;
  className?: string;
}

export const GuidedClickThrough: React.FC<GuidedClickThroughProps> = ({
  imageUrl,
  steps,
  title = "Interactive Walkthrough",
  onComplete,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showInstructions, setShowInstructions] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }
    
    setIsPlaying(true);
    setShowInstructions(false);
    playNextStep();
  };

  const playNextStep = () => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      const duration = step.duration || 2000;
      
      timeoutRef.current = setTimeout(() => {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        
        if (currentStep + 1 < steps.length) {
          setCurrentStep(currentStep + 1);
          playNextStep();
        } else {
          setIsPlaying(false);
          onComplete?.();
        }
      }, duration);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setShowInstructions(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (!isPlaying) {
      setCurrentStep(stepIndex);
      setShowInstructions(false);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((completedSteps.size) / steps.length) * 100;

  const getActionIcon = (action: string) => {
    switch (action) {
      case "click": return MousePointer;
      case "hover": return Eye;
      case "scroll": return ArrowRight;
      case "type": return Target;
      default: return MousePointer;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "click": return "from-blue-600 to-cyan-600";
      case "hover": return "from-green-600 to-emerald-600";
      case "scroll": return "from-purple-600 to-violet-600";
      case "type": return "from-orange-600 to-red-600";
      default: return "from-blue-600 to-cyan-600";
    }
  };

  return (
    <div className={`bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            {title}
          </h3>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-zinc-700 text-zinc-300">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handlePlay}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Interactive area */}
      <div className="relative">
        {/* Screenshot */}
        <div className="relative overflow-hidden bg-zinc-800">
          <img 
            src={imageUrl} 
            alt="Interactive Screenshot"
            className="w-full h-auto"
          />
          
          {/* Step indicators */}
          {steps.map((step, index) => {
            const ActionIcon = getActionIcon(step.action);
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep && !showInstructions;
            const isUpcoming = index > currentStep;
            
            return (
              <motion.div
                key={step.id}
                className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2`}
                style={{ 
                  left: `${step.x}%`, 
                  top: `${step.y}%` 
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isCurrent ? 1.2 : 1, 
                  opacity: 1 
                }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleStepClick(index)}
              >
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  ${isCompleted ? 'bg-green-600 border-green-400' : 
                    isCurrent ? `bg-gradient-to-r ${getActionColor(step.action)} border-white` :
                    isUpcoming ? 'bg-zinc-600 border-zinc-500' : 'bg-blue-600 border-blue-400'}
                  ${isCurrent ? 'animate-pulse' : ''}
                  ${step.criticalPoint ? 'ring-4 ring-red-500/50' : ''}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : (
                    <ActionIcon className="h-5 w-5 text-white" />
                  )}
                </div>
                
                {/* Step number */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-900 border border-zinc-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>
                
                {/* Critical point indicator */}
                {step.criticalPoint && (
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </motion.div>
            );
          })}
          
          {/* Current step cursor animation */}
          <AnimatePresence>
            {isPlaying && currentStepData && (
              <motion.div
                className="absolute pointer-events-none"
                style={{ 
                  left: `${currentStepData.x}%`, 
                  top: `${currentStepData.y}%` 
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <div className="transform -translate-x-1/2 -translate-y-1/2">
                  <MousePointer className="h-6 w-6 text-yellow-400 animate-bounce" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instructions overlay */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center"
            >
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md mx-4 text-center">
                <Target className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Interactive Training</h4>
                <p className="text-zinc-400 mb-4">
                  Follow the guided steps to learn the proper workflow. 
                  Click numbered points or press play for automatic guidance.
                </p>
                <Button 
                  onClick={() => setShowInstructions(false)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  Start Learning
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Current step info */}
      {!showInstructions && currentStepData && (
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getActionColor(currentStepData.action)} flex items-center justify-center flex-shrink-0`}>
              {React.createElement(getActionIcon(currentStepData.action), { className: "h-4 w-4 text-white" })}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white">{currentStepData.title}</h4>
                {currentStepData.criticalPoint && (
                  <Badge className="bg-red-600 text-white text-xs">Critical</Badge>
                )}
              </div>
              <p className="text-sm text-zinc-400">{currentStepData.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
