
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Shield, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RedFlagIdentifierProps {
  content: string;
  className?: string;
}

// Critical healthcare keywords that should be flagged
const RED_FLAG_KEYWORDS = [
  // Safety terms
  "emergency", "urgent", "critical", "stat", "code blue", "code red",
  "allergic reaction", "anaphylaxis", "overdose", "bleeding", "trauma",
  "cardiac arrest", "respiratory distress", "stroke", "seizure",
  
  // HIPAA/Privacy terms
  "patient information", "medical records", "protected health information", 
  "phi", "confidential", "unauthorized access", "breach", "disclosure",
  
  // Medication safety
  "medication error", "wrong dose", "wrong patient", "adverse reaction",
  "contraindication", "drug interaction", "allergy alert",
  
  // Communication critical points
  "do not resuscitate", "dnr", "advanced directive", "family notification",
  "patient consent", "informed consent", "language barrier"
];

const SEVERITY_LEVELS = {
  high: { color: "bg-red-600", icon: AlertTriangle, label: "Critical" },
  medium: { color: "bg-orange-600", icon: Shield, label: "Important" },
  low: { color: "bg-yellow-600", icon: Eye, label: "Note" }
};

export const RedFlagIdentifier: React.FC<RedFlagIdentifierProps> = ({
  content,
  className = ""
}) => {
  const identifyRedFlags = (text: string) => {
    let processedText = text;
    const flaggedTerms: Array<{ term: string; severity: keyof typeof SEVERITY_LEVELS }> = [];
    
    RED_FLAG_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(text)) {
        // Determine severity based on keyword type
        let severity: keyof typeof SEVERITY_LEVELS = 'low';
        
        if (keyword.includes('emergency') || keyword.includes('critical') || 
            keyword.includes('cardiac') || keyword.includes('respiratory') ||
            keyword.includes('code') || keyword.includes('trauma')) {
          severity = 'high';
        } else if (keyword.includes('patient information') || keyword.includes('phi') ||
                   keyword.includes('medication') || keyword.includes('allergy')) {
          severity = 'medium';
        }
        
        flaggedTerms.push({ term: keyword, severity });
        
        processedText = processedText.replace(regex, (match) => 
          `<span class="red-flag-highlight" data-severity="${severity}">${match}</span>`
        );
      }
    });
    
    return { processedText, flaggedTerms };
  };

  const { processedText, flaggedTerms } = identifyRedFlags(content);
  
  if (flaggedTerms.length === 0) {
    return (
      <div className={className}>
        <p className="text-zinc-300 leading-relaxed">{content}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Red flags summary */}
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span className="text-sm font-medium text-red-400">
            {flaggedTerms.length} Critical Term{flaggedTerms.length !== 1 ? 's' : ''} Identified
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {flaggedTerms.map((flag, index) => {
            const severityConfig = SEVERITY_LEVELS[flag.severity];
            const Icon = severityConfig.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Badge 
                  className={`${severityConfig.color} text-white text-xs flex items-center gap-1`}
                >
                  <Icon className="h-3 w-3" />
                  {flag.term}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Content with highlighted terms */}
      <div 
        className="text-zinc-300 leading-relaxed"
        dangerouslySetInnerHTML={{ 
          __html: processedText 
        }}
      />
      
      <style jsx>{`
        .red-flag-highlight {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          position: relative;
          animation: pulse-glow 2s infinite;
        }
        
        .red-flag-highlight[data-severity="high"] {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          box-shadow: 0 0 8px rgba(220, 38, 38, 0.5);
        }
        
        .red-flag-highlight[data-severity="medium"] {
          background: linear-gradient(135deg, #ea580c, #c2410c);
          box-shadow: 0 0 6px rgba(234, 88, 12, 0.4);
        }
        
        .red-flag-highlight[data-severity="low"] {
          background: linear-gradient(135deg, #eab308, #ca8a04);
          color: #000;
          box-shadow: 0 0 4px rgba(234, 179, 8, 0.3);
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
