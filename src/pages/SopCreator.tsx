
import { Card, CardContent } from "@/components/ui/card";
import { useSopContext } from "@/context/SopContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toolbar from "@/components/Toolbar";
import { motion } from "@/components/MotionWrapper";
import { ArrowLeft, ArrowRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepCarousel from "@/components/StepCarousel";
import OrganizationHeader from "@/components/OrganizationHeader";

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
