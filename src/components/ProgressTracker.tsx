
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressTrackerProps {
  completed: number;
  total: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completed, total }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-4 my-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-zinc-300">Progress Tracking</h3>
        <span className="text-sm text-zinc-400">{completed} of {total} steps completed</span>
      </div>
      
      <Progress value={percentage} className="h-2 bg-zinc-700">
        <div 
          className="h-full bg-[#007AFF] rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        />
      </Progress>
      
      <div className="mt-2 text-xs text-zinc-500">
        <p>This interactive progress tracker will be included in the HTML export.</p>
      </div>
    </div>
  );
};

export default ProgressTracker;
