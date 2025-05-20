
import { useState } from "react";
import { Link } from "react-router-dom";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

const HomePage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#121212] text-[#F1F1F1] dark">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#121212]/80 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-medium tracking-tight text-white">SOP</span>
            <span className="text-2xl font-light tracking-tight text-[#007AFF]">ify</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Home</a>
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">How It Works</a>
            <a href="#templates" className="text-sm text-zinc-400 hover:text-white transition-colors">Templates</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <a href="#help" className="text-sm text-zinc-400 hover:text-white transition-colors">Help</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" aria-label="Toggle theme">
              {theme === "dark" ? <SunIcon className="h-[1.2rem] w-[1.2rem] text-zinc-400" /> : <MoonIcon className="h-[1.2rem] w-[1.2rem] text-zinc-400" />}
            </Button>
            <Link to="/app">
              <Button className="bg-[#007AFF] text-white hover:bg-[#0062CC] rounded-xl">
                Start Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
      
      {/* Features Section */}
      <section className="py-16 bg-[#1E1E1E] border-t border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold tracking-tight text-white text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature Cards */}
            <div className="bg-[#2C2C2E] p-6 rounded-2xl glass-morphism transform transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-[#007AFF]/10 flex items-center justify-center rounded-full mb-4">
                <svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Auto-save</h3>
              <p className="text-zinc-400">Your SOPs are automatically saved to your browser's local storage.</p>
            </div>
            
            <div className="bg-[#2C2C2E] p-6 rounded-2xl glass-morphism transform transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-[#007AFF]/10 flex items-center justify-center rounded-full mb-4">
                <svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">PDF Export</h3>
              <p className="text-zinc-400">Export your SOPs as professional PDF documents with a single click.</p>
            </div>
            
            <div className="bg-[#2C2C2E] p-6 rounded-2xl glass-morphism transform transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-[#007AFF]/10 flex items-center justify-center rounded-full mb-4">
                <svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Step-by-step Format</h3>
              <p className="text-zinc-400">Create clear, numbered steps with detailed instructions and screenshots.</p>
            </div>
            
            <div className="bg-[#2C2C2E] p-6 rounded-2xl glass-morphism transform transition-transform hover:scale-105">
              <div className="w-12 h-12 bg-[#007AFF]/10 flex items-center justify-center rounded-full mb-4">
                <svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Dark Mode Ready</h3>
              <p className="text-zinc-400">Create and edit your SOPs in a comfortable dark mode interface.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-semibold tracking-tight text-white text-center mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial Cards */}
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#007AFF] to-purple-500 mb-4"></div>
            <p className="text-zinc-300 mb-4">"This app has completely transformed how we create and share procedures at our company."</p>
            <p className="text-sm text-zinc-500 font-medium">Alex Chen, Operations Manager</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-[#007AFF] mb-4"></div>
            <p className="text-zinc-300 mb-4">"The simplicity and clean design make creating SOPs a breeze. Highly recommended!"</p>
            <p className="text-sm text-zinc-500 font-medium">Sarah Johnson, CEO</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-red-500 mb-4"></div>
            <p className="text-zinc-300 mb-4">"I love how I can create professional-looking documentation in minutes rather than hours."</p>
            <p className="text-sm text-zinc-500 font-medium">Michael Torres, Team Lead</p>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-[#1E1E1E] border-t border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold tracking-tight text-white text-center mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-[#2C2C2E] p-8 rounded-2xl glass-morphism">
              <h3 className="text-2xl font-medium text-white mb-2">Free</h3>
              <p className="text-4xl font-bold text-white mb-6">$0<span className="text-lg text-zinc-400 font-normal">/month</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#007AFF] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Unlimited SOPs</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#007AFF] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">PDF Export</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#007AFF] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-300">Basic Templates</span>
                </li>
                <li className="flex items-start text-zinc-500">
                  <svg className="w-6 h-6 text-zinc-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Team Sharing</span>
                </li>
              </ul>
              <Link to="/app">
                <Button className="w-full bg-[#3A3A3C] text-white hover:bg-[#4A4A4C] rounded-xl py-6">
                  Get Started
                </Button>
              </Link>
            </div>
            
            {/* Pro Tier */}
            <div className="bg-[#007AFF] p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-xs text-white px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              <h3 className="text-2xl font-medium text-white mb-2">Pro</h3>
              <p className="text-4xl font-bold text-white mb-6">$12<span className="text-lg text-white/80 font-normal">/month</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-white mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Everything in Free</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-white mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Team Sharing</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-white mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Premium Templates</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-white mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Priority Support</span>
                </li>
              </ul>
              <Link to="/app">
                <Button className="w-full bg-white text-[#007AFF] hover:bg-gray-100 rounded-xl py-6">
                  Try Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-[#121212]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-1 mb-4">
                <span className="text-xl font-medium tracking-tight text-white">SOP</span>
                <span className="text-xl font-light tracking-tight text-[#007AFF]">ify</span>
              </div>
              <p className="text-sm text-zinc-500">Create beautiful SOPs in minutes.</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 pt-8 text-center">
            <p className="text-sm text-zinc-500">© 2025 SOPify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
