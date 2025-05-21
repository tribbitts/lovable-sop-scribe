
import JsonDialog from "@/components/toolbar/JsonDialog";
import PdfExportManager from "@/components/toolbar/PdfExportManager";

const Toolbar = () => {
  return (
    <div className="flex flex-wrap justify-end items-center mb-6 gap-2">
      <div className="flex flex-wrap gap-2">
        <JsonDialog />
        <PdfExportManager />
      </div>
    </div>
  );
};

export default Toolbar;
