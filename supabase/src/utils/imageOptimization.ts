
// Image optimization utilities for SEO
export const generateImageAlt = (context: string, description?: string): string => {
  const baseAlt = `SOPify ${context}`;
  return description ? `${baseAlt} - ${description}` : baseAlt;
};

export const optimizeImageForSEO = (imageName: string, context: string): object => {
  return {
    alt: generateImageAlt(context),
    title: `SOPify ${context}`,
    loading: "lazy" as const,
    decoding: "async" as const
  };
};

// SEO-friendly image naming conventions
export const getSEOImageName = (originalName: string, context: string): string => {
  const cleanName = originalName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `sopify-${context}-${cleanName}`;
};

// Image compression settings for web optimization
export const imageCompressionSettings = {
  quality: 85,
  format: 'webp' as const,
  fallback: 'jpeg' as const,
  sizes: {
    thumbnail: { width: 300, height: 200 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 800 },
    hero: { width: 1920, height: 1080 }
  }
};
