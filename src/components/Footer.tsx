
import { Card, CardContent } from "@/components/ui/card";
import { useSopContext } from "@/context/SopContext";

const Footer = () => {
  const { sopDocument } = useSopContext();
  
  return (
    <Card className="mb-6 bg-[#1E1E1E] border-zinc-800 rounded-2xl">
      <CardContent className="pt-4 pb-4">
        <div className="text-center text-sm text-zinc-400">
          For internal use only | © 2025 | {sopDocument.companyName}
        </div>
      </CardContent>
    </Card>
  );
};

export default Footer;
