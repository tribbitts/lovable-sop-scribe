
import { SopProvider } from "@/context/SopContext";
import SopCreator from "./SopCreator";

const Index = () => {
  return (
    <SopProvider>
      <SopCreator />
    </SopProvider>
  );
};

export default Index;
