
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-gradient mb-6">
          Create SOPs.<br />Clean. Fast. Done.
        </h1>
        <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
          Create professional Standard Operating Procedures with step-by-step instructions and annotated screenshots. 
          All data stays in your browser for privacy.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/app">
            <Button className="bg-[#007AFF] text-white hover:bg-[#0062CC] rounded-xl px-8 py-6 text-base w-full sm:w-auto">
              Start for Free
            </Button>
          </Link>
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl px-8 py-6 text-base w-full sm:w-auto">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
