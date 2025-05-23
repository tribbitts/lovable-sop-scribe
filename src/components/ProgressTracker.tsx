import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressTrackerProps, ProgressSession } from "@/types/sop";
import { RotateCcw, Save, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  completed,
  total,
  showPercentage = true,
  variant = "bar",
  className = ""
}) => {
  const [sessions, setSessions] = useState<ProgressSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("sop-progress-sessions");
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (error) {
        console.error("Failed to load progress sessions:", error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem("sop-progress-sessions", JSON.stringify(sessions));
  }, [sessions]);

  const saveCurrentSession = () => {
    const sessionName = prompt("Enter a name for this progress session:");
    if (!sessionName) return;

    const newSession: ProgressSession = {
      id: Date.now().toString(),
      name: sessionName,
      completedSteps: [], // This would be populated by the parent component
      totalSteps: total,
      lastUpdated: new Date().toISOString(),
      sopTitle: "Current SOP" // This would come from context
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession.id);
  };

  const resetProgress = () => {
    if (window.confirm("Are you sure you want to reset progress? This cannot be undone.")) {
      setCurrentSession(null);
      // This would trigger a callback to parent to reset actual progress
    }
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(sessionId);
      // This would trigger a callback to parent to load the session
    }
  };

  const deleteSession = (sessionId: string) => {
    if (window.confirm("Delete this progress session?")) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession === sessionId) {
        setCurrentSession(null);
      }
    }
  };

  const renderBarVariant = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Progress Tracker</h3>
          {showPercentage && (
            <Badge variant="secondary" className="bg-[#007AFF] text-white">
              {percentage}%
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={saveCurrentSession}
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetProgress}
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={percentage} 
          className="w-full h-3 bg-zinc-800"
        />
        <div className="flex justify-between text-sm text-zinc-400">
          <span>{completed} of {total} steps completed</span>
          <span>{total - completed} remaining</span>
        </div>
      </div>
    </div>
  );

  const renderRingVariant = () => {
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex items-center justify-center relative">
        <svg width="120" height="120" className="transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="rgb(39 39 42)"
            strokeWidth="8"
            fill="transparent"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="45"
            stroke="#007AFF"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{percentage}%</span>
          <span className="text-sm text-zinc-400">{completed}/{total}</span>
        </div>
      </div>
    );
  };

  const renderStepsVariant = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Steps Progress</h3>
        <Badge variant="secondary" className="bg-[#007AFF] text-white">
          {completed}/{total}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i < completed
                ? "bg-[#007AFF] text-white"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {i + 1}
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case "ring":
        return renderRingVariant();
      case "steps":
        return renderStepsVariant();
      default:
        return renderBarVariant();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          {renderContent()}
          
          {/* Saved Sessions */}
          {sessions.length > 0 && variant === "bar" && (
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Saved Sessions
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                <AnimatePresence>
                  {sessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        currentSession === session.id 
                          ? "bg-[#007AFF]/20 border border-[#007AFF]" 
                          : "bg-zinc-800/50 hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {session.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {new Date(session.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => loadSession(session.id)}
                          className="text-xs px-2 py-1 h-auto text-zinc-300 hover:text-white"
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSession(session.id)}
                          className="text-xs px-2 py-1 h-auto text-red-400 hover:text-red-300"
                        >
                          ×
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgressTracker;
