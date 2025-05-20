
import { SopProvider } from "@/context/SopContext";
import SopCreator from "./SopCreator";

const Index = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <SopProvider>
        <SopCreator />
      </SopProvider>
    </div>
  );
};

export default Index;
