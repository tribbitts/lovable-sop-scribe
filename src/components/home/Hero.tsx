
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-gradient mb-6">
          Create Interactive<br />Training Modules
        </h1>
        <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
          Build engaging, offline training experiences with quizzes, progress tracking, and completion certificates. 
          Perfect for employee onboarding, process training, and educational content.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/app">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 rounded-xl px-8 py-6 text-base w-full sm:w-auto">
              Create Your First Module
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
