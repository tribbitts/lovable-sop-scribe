
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageCircle, 
  Copy, 
  Heart, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Volume2,
  Star,
  Users,
  Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CommunicationSnippet {
  id: string;
  category: "greeting" | "empathy" | "clarification" | "de-escalation" | "safety" | "closure";
  situation: string;
  phrase: string;
  explanation: string;
  tone: "professional" | "empathetic" | "urgent" | "reassuring";
  priority: "high" | "medium" | "low";
  tags: string[];
}

interface PatientCommunicationSnippetsProps {
  category?: "greeting" | "empathy" | "clarification" | "de-escalation" | "safety" | "closure" | "all";
  situation?: string;
  className?: string;
}

const COMMUNICATION_SNIPPETS: CommunicationSnippet[] = [
  // Greeting phrases
  {
    id: "greeting-1",
    category: "greeting",
    situation: "Patient arrives for appointment",
    phrase: "Good morning! I'm here to help you today. How can I make your visit as comfortable as possible?",
    explanation: "Sets a welcoming tone and immediately focuses on patient comfort and care.",
    tone: "professional",
    priority: "high",
    tags: ["arrival", "comfort", "first-contact"]
  },
  {
    id: "greeting-2", 
    category: "greeting",
    situation: "Phone call intake",
    phrase: "Thank you for calling [Clinic Name]. This is [Your Name]. I want to make sure I understand your needs completely - how can I help you today?",
    explanation: "Professional phone greeting that emphasizes understanding and help.",
    tone: "professional",
    priority: "high",
    tags: ["phone", "intake", "understanding"]
  },
  
  // Empathy phrases
  {
    id: "empathy-1",
    category: "empathy",
    situation: "Patient expressing frustration",
    phrase: "I can hear that this situation is really frustrating for you, and that's completely understandable. Let me see what I can do to help resolve this.",
    explanation: "Validates patient emotions and commits to action - essential for de-escalation.",
    tone: "empathetic",
    priority: "high",
    tags: ["validation", "frustration", "problem-solving"]
  },
  {
    id: "empathy-2",
    category: "empathy", 
    situation: "Patient worried about procedure",
    phrase: "It's completely normal to feel anxious about this. Many patients have similar concerns, and I'm here to answer any questions that might help put you at ease.",
    explanation: "Normalizes anxiety and offers support - reduces patient stress.",
    tone: "reassuring",
    priority: "medium",
    tags: ["anxiety", "normal", "support"]
  },
  
  // Clarification phrases
  {
    id: "clarification-1",
    category: "clarification",
    situation: "Confirming patient information",
    phrase: "I want to make sure I have this exactly right for your safety. Can you please confirm your date of birth and spell your last name for me?",
    explanation: "Links accuracy to patient safety - emphasizes why verification matters.",
    tone: "professional",
    priority: "high",
    tags: ["verification", "safety", "accuracy"]
  },
  {
    id: "clarification-2",
    category: "clarification",
    situation: "Understanding patient symptoms",
    phrase: "Help me understand this better so we can make sure you get the right care. Can you tell me more about when this started and what it feels like?",
    explanation: "Shows commitment to appropriate care while gathering necessary information.",
    tone: "professional",
    priority: "high",
    tags: ["symptoms", "care", "information"]
  },
  
  // De-escalation phrases
  {
    id: "deescalation-1",
    category: "de-escalation",
    situation: "Angry patient about wait time",
    phrase: "I sincerely apologize for the delay, and I understand how valuable your time is. Let me check on your status right now and give you an updated timeframe.",
    explanation: "Acknowledges the problem, validates their concern, and provides immediate action.",
    tone: "empathetic",
    priority: "high",
    tags: ["apology", "wait-time", "action"]
  },
  {
    id: "deescalation-2",
    category: "de-escalation", 
    situation: "Patient upset about billing",
    phrase: "I can see this billing situation is causing you stress, and that's the last thing we want. Let me connect you with someone who can review this thoroughly and find a solution.",
    explanation: "Acknowledges emotional impact and offers concrete help with expertise.",
    tone: "empathetic",
    priority: "high",
    tags: ["billing", "stress", "solution"]
  },
  
  // Safety phrases
  {
    id: "safety-1",
    category: "safety",
    situation: "Medication allergy check",
    phrase: "For your safety, I need to verify your current allergies and medications. Even if nothing has changed, this helps us provide the safest care possible.",
    explanation: "Frames routine safety checks as essential care, not bureaucracy.",
    tone: "professional",
    priority: "high",
    tags: ["allergies", "medications", "safety-check"]
  },
  {
    id: "safety-2",
    category: "safety",
    situation: "Emergency situation identification",
    phrase: "I need to ask some quick questions to make sure we get you the right level of care immediately. Are you experiencing chest pain, difficulty breathing, or severe bleeding?",
    explanation: "Direct, clear triage questions that prioritize immediate safety assessment.",
    tone: "urgent",
    priority: "high",
    tags: ["triage", "emergency", "immediate"]
  },
  
  // Closure phrases
  {
    id: "closure-1",
    category: "closure",
    situation: "End of appointment",
    phrase: "Before you leave, do you have any questions about what we discussed today? I want to make sure you feel confident about your next steps.",
    explanation: "Ensures understanding and empowers patient with knowledge and confidence.",
    tone: "professional",
    priority: "medium",
    tags: ["questions", "understanding", "confidence"]
  },
  {
    id: "closure-2",
    category: "closure",
    situation: "Follow-up scheduling",
    phrase: "Let's get your follow-up scheduled now while you're here. This ensures continuity of care and keeps you on track with your treatment plan.",
    explanation: "Links scheduling to medical benefit, not just administrative convenience.",
    tone: "professional",
    priority: "medium",
    tags: ["follow-up", "continuity", "treatment"]
  }
];

const CATEGORY_CONFIG = {
  greeting: { icon: Users, color: "from-blue-600 to-cyan-600", label: "Greetings" },
  empathy: { icon: Heart, color: "from-pink-600 to-rose-600", label: "Empathy" },
  clarification: { icon: MessageCircle, color: "from-green-600 to-emerald-600", label: "Clarification" },
  "de-escalation": { icon: Shield, color: "from-orange-600 to-amber-600", label: "De-escalation" },
  safety: { icon: AlertTriangle, color: "from-red-600 to-rose-600", label: "Safety" },
  closure: { icon: CheckCircle, color: "from-purple-600 to-violet-600", label: "Closure" }
};

const TONE_CONFIG = {
  professional: { color: "bg-blue-600", icon: Star },
  empathetic: { color: "bg-pink-600", icon: Heart },
  urgent: { color: "bg-red-600", icon: AlertTriangle },
  reassuring: { color: "bg-green-600", icon: Shield }
};

export const PatientCommunicationSnippets: React.FC<PatientCommunicationSnippetsProps> = ({
  category = "all",
  situation,
  className = ""
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favoriteSnippets, setFavoriteSnippets] = useState<Set<string>>(new Set());

  const filteredSnippets = COMMUNICATION_SNIPPETS.filter(snippet => {
    if (selectedCategory !== "all" && snippet.category !== selectedCategory) return false;
    if (situation && !snippet.situation.toLowerCase().includes(situation.toLowerCase())) return false;
    return true;
  });

  const handleCopySnippet = async (snippet: CommunicationSnippet) => {
    try {
      await navigator.clipboard.writeText(snippet.phrase);
      setCopiedId(snippet.id);
      
      toast({
        title: "Copied to clipboard",
        description: "Communication snippet copied successfully",
      });
      
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleToggleFavorite = (snippetId: string) => {
    setFavoriteSnippets(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(snippetId)) {
        newFavorites.delete(snippetId);
      } else {
        newFavorites.add(snippetId);
      }
      return newFavorites;
    });
  };

  const categories = Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageCircle className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Patient Communication Snippets</h3>
        </div>
        <p className="text-zinc-400">
          Best-practice communication phrases for professional, empathetic patient interactions
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          size="sm"
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
          className={selectedCategory === "all" ? 
            "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : 
            "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          }
        >
          All Categories
        </Button>
        
        {categories.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const Icon = config.icon;
          const isSelected = selectedCategory === cat;
          
          return (
            <Button
              key={cat}
              size="sm"
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className={isSelected ? 
                `bg-gradient-to-r ${config.color} text-white` : 
                "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }
            >
              <Icon className="h-4 w-4 mr-1" />
              {config.label}
            </Button>
          );
        })}
      </div>

      {/* Snippets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredSnippets.map((snippet, index) => {
            const categoryConfig = CATEGORY_CONFIG[snippet.category];
            const toneConfig = TONE_CONFIG[snippet.tone];
            const Icon = categoryConfig.icon;
            const ToneIcon = toneConfig.icon;
            const isFavorite = favoriteSnippets.has(snippet.id);
            const isCopied = copiedId === snippet.id;
            
            return (
              <motion.div
                key={snippet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 transition-all duration-200 h-full">
                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${categoryConfig.color} flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <Badge className={`${toneConfig.color} text-white text-xs flex items-center gap-1`}>
                          <ToneIcon className="h-3 w-3" />
                          {snippet.tone}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleFavorite(snippet.id)}
                          className={`p-1 h-auto ${isFavorite ? 'text-yellow-400' : 'text-zinc-500 hover:text-yellow-400'}`}
                        >
                          <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopySnippet(snippet)}
                          className={`p-1 h-auto ${isCopied ? 'text-green-400' : 'text-zinc-500 hover:text-blue-400'}`}
                        >
                          {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Situation */}
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        <span className="text-xs font-medium text-zinc-400">Situation</span>
                      </div>
                      <p className="text-sm text-zinc-300 font-medium">{snippet.situation}</p>
                    </div>
                    
                    {/* Phrase */}
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">Recommended Phrase</span>
                      </div>
                      <p className="text-sm text-white leading-relaxed italic">
                        "{snippet.phrase}"
                      </p>
                    </div>
                    
                    {/* Explanation */}
                    <div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        <span className="font-medium">Why this works:</span> {snippet.explanation}
                      </p>
                    </div>
                    
                    {/* Tags */}
                    {snippet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {snippet.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="text-xs px-2 py-1 bg-zinc-700/50 rounded text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {filteredSnippets.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">No communication snippets found for the selected criteria.</p>
        </div>
      )}
    </div>
  );
};
