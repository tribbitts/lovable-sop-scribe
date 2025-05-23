
import React from "react";

interface AuthHeaderProps {
  title?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title }) => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-1">
        <span className="text-3xl font-medium tracking-tight text-white">SOP</span>
        <span className="text-3xl font-light tracking-tight text-[#007AFF]">ify</span>
      </div>
      <p className="text-zinc-400 mt-2">{title || "Create professional SOPs in minutes"}</p>
    </div>
  );
};

export default AuthHeader;
