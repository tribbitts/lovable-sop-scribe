
import { Card, CardContent } from "@/components/ui/card";
import { useSopContext } from "@/context/SopContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toolbar from "@/components/Toolbar";
import { motion } from "@/components/MotionWrapper";
import StepCarousel from "@/components/StepCarousel";
import OrganizationHeader from "@/components/OrganizationHeader";
import ProgressTracker from "@/components/ProgressTracker";
import { useState, useEffect } from "react";

const SopCreator = () => {
  const { sopDocument } = useSopContext();
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  
  // Simulate step completion for demo purposes
  useEffect(() => {
    if (sopDocument.steps.length > 0) {
      const completed = Math.min(
        Math.floor(Math.random() * (sopDocument.steps.length + 1)), 
        sopDocument.steps.length
      );
      setCompletedSteps(completed);
    } else {
      setCompletedSteps(0);
    }
  }, [sopDocument.steps.length]);

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-6 bg-[#1E1E1E] border-zinc-800 overflow-hidden rounded-2xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white mb-4">SOP Creator</h2>
            <p className="text-zinc-400">
              Create professional Standard Operating Procedures with step-by-step 
              instructions and annotated screenshots. All data stays in your browser for privacy.
            </p>
            <div className="mt-4 flex items-center text-sm text-zinc-500">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 mr-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-1"></span>
                Not signed in
              </span>
              <span>SOPs are saved locally. Sign in to save to your account.</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <OrganizationHeader />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Toolbar />
      </motion.div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Header />
        </motion.div>

        {sopDocument.steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ProgressTracker 
              completed={completedSteps} 
              total={sopDocument.steps.length} 
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative"
        >
          <StepCarousel />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Footer />
        </motion.div>
      </div>
    </div>
  );
};

export default SopCreator;
