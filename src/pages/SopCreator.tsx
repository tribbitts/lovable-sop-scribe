
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSopContext } from "@/context/SopContext";
import Header from "@/components/Header";
import StepEditor from "@/components/StepEditor";
import Footer from "@/components/Footer";
import Toolbar from "@/components/Toolbar";

const SopCreator = () => {
  const { sopDocument } = useSopContext();

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>SOP Creator</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Create professional Standard Operating Procedures with step-by-step
            instructions and annotated screenshots. All data stays in your
            browser for privacy.
          </p>
        </CardContent>
      </Card>

      <Toolbar />

      <div className="space-y-6">
        <Header />

        <h2 className="text-xl font-bold mb-4">Steps</h2>
        {sopDocument.steps.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 py-8">
                No steps added yet. Click "Add Step" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          sopDocument.steps.map((step, index) => (
            <StepEditor key={step.id} step={step} index={index} />
          ))
        )}
        
        <Footer />
      </div>
    </div>
  );
};

export default SopCreator;
