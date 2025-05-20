
import { Card, CardContent } from "@/components/ui/card";
import { useSopContext } from "@/context/SopContext";
import Header from "@/components/Header";
import StepEditor from "@/components/StepEditor";
import Footer from "@/components/Footer";
import Toolbar from "@/components/Toolbar";
import { motion } from "@/components/MotionWrapper";

const SopCreator = () => {
  const { sopDocument } = useSopContext();

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
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Toolbar />
      </motion.div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Header />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Steps</h2>
          {sopDocument.steps.length === 0 ? (
            <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl">
              <CardContent className="pt-6">
                <p className="text-center text-zinc-500 py-8">
                  No steps added yet. Click "Add Step" to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            sopDocument.steps.map((step, index) => (
              <StepEditor key={step.id} step={step} index={index} />
            ))
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Footer />
        </motion.div>
      </div>
    </div>
  );
};

export default SopCreator;
