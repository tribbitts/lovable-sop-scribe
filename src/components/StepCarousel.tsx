
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSopContext } from "@/context/SopContext";
import { ArrowLeft, ArrowRight, Plus, Circle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useCarousel } from "@/components/ui/carousel";
import StepEditor from "@/components/StepEditor";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { motion } from "@/components/MotionWrapper";

const StepCarousel = () => {
  const { sopDocument, addStep } = useSopContext();
  const [activeStep, setActiveStep] = useState(0);

  const handleAddStep = () => {
    addStep();
    // Set active step to the newly added step
    setTimeout(() => {
      setActiveStep(sopDocument.steps.length);
    }, 100);
    
    toast({
      title: "Step Added",
      description: "A new step has been added to your SOP.",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          {sopDocument.steps.length > 0 
            ? `Step ${activeStep + 1} of ${sopDocument.steps.length}` 
            : "Steps"}
        </h2>
        <Button onClick={handleAddStep} className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Step
        </Button>
      </div>

      {sopDocument.steps.length === 0 ? (
        <Card className="bg-[#1E1E1E] border-zinc-800 rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-center text-zinc-500 py-12">
              <div className="mb-4 flex justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <Circle className="w-16 h-16 text-zinc-700 stroke-[1.5]" />
                </motion.div>
              </div>
              <h3 className="text-lg font-medium text-zinc-300 mb-2">No steps added yet</h3>
              <p className="max-w-md mx-auto">
                Get started by adding your first step to create your SOP documentation.
              </p>
              <Button 
                onClick={handleAddStep} 
                className="mt-6 bg-[#007AFF] hover:bg-[#0069D9] text-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Your First Step
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <Carousel
            opts={{ loop: false }}
            className="w-full"
            setApi={(api) => {
              api?.on("select", () => {
                setActiveStep(api.selectedScrollSnap());
              });
            }}
            onSelect={() => {}}
          >
            <CarouselContent>
              {sopDocument.steps.map((step, index) => (
                <CarouselItem key={step.id} className="md:basis-full">
                  <div className="p-1">
                    <StepEditor step={step} index={index} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white" />
          </Carousel>

          {/* Step indicator dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {sopDocument.steps.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  index === activeStep 
                    ? "bg-[#007AFF] scale-125" 
                    : "bg-zinc-700 hover:bg-zinc-600"
                )}
                onClick={() => {
                  setActiveStep(index);
                }}
                aria-label={`Go to step ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepCarousel;
