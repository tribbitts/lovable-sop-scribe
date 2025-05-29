
import React from 'react';

// This is a simple version of motion components for our project
// You could integrate framer-motion for more advanced animations

interface MotionProps {
  children: React.ReactNode;
  initial?: {
    opacity?: number;
    y?: number;
    scale?: number;
    height?: number | string;
  };
  animate?: {
    opacity?: number;
    y?: number;
    scale?: number;
    height?: number | string;
  };
  transition?: {
    duration?: number;
    delay?: number;
    type?: string;
    stiffness?: number;
    damping?: number;
  };
  className?: string;
}

const MotionDiv: React.FC<MotionProps> = ({ 
  children, 
  initial, 
  animate, 
  transition, 
  className = '' 
}) => {
  const [isAnimated, setIsAnimated] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, (transition?.delay || 0) * 1000);
    
    return () => clearTimeout(timer);
  }, [transition?.delay]);
  
  const getStyles = () => {
    if (!isAnimated) {
      return {
        opacity: initial?.opacity,
        transform: [
          initial?.y ? `translateY(${initial.y}px)` : undefined,
          initial?.scale ? `scale(${initial.scale})` : undefined
        ].filter(Boolean).join(' ') || undefined,
        height: initial?.height,
        transition: `opacity ${transition?.duration || 0.3}s, transform ${transition?.duration || 0.3}s, height ${transition?.duration || 0.3}s`
      };
    }
    
    return {
      opacity: animate?.opacity,
      transform: [
        animate?.y !== undefined ? `translateY(${animate.y}px)` : undefined,
        animate?.scale !== undefined ? `scale(${animate.scale})` : undefined
      ].filter(Boolean).join(' ') || undefined,
      height: animate?.height,
      transition: `opacity ${transition?.duration || 0.3}s, transform ${transition?.duration || 0.3}s, height ${transition?.duration || 0.3}s`
    };
  };
  
  return (
    <div className={className} style={getStyles()}>
      {children}
    </div>
  );
};

export const motion = {
  div: MotionDiv
};
