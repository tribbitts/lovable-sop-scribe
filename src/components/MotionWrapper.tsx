
import React from 'react';

// This is a simple version of motion components for our project
// You could integrate framer-motion for more advanced animations

interface MotionProps {
  children: React.ReactNode;
  initial?: any;
  animate?: any;
  transition?: any;
  className?: string;
}

export const motion = {
  div: ({ children, initial, animate, transition, className = '' }: MotionProps) => {
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
          transform: initial?.y ? `translateY(${initial.y}px)` : undefined,
          transition: `opacity ${transition?.duration || 0.3}s, transform ${transition?.duration || 0.3}s`
        };
      }
      
      return {
        opacity: animate?.opacity,
        transform: animate?.y !== undefined ? `translateY(${animate.y}px)` : undefined,
        transition: `opacity ${transition?.duration || 0.3}s, transform ${transition?.duration || 0.3}s`
      };
    };
    
    return (
      <div className={className} style={getStyles()}>
        {children}
      </div>
    );
  }
};
