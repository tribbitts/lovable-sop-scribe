
export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  schemaMarkup?: object;
}

export const defaultSEO: SEOMetadata = {
  title: "SOPify - Create Professional SOPs with Screenshots | Standard Operating Procedures",
  description: "Create professional Standard Operating Procedures with step-by-step instructions and annotated screenshots. Export to PDF, HTML, and interactive training modules. Start free today.",
  keywords: "SOP creator, standard operating procedures, business documentation, process documentation, workflow automation, PDF export, training materials",
  ogImage: "/og-image.png",
  ogType: "website"
};

export const seoPages: Record<string, SEOMetadata> = {
  "/": {
    title: "SOPify - Professional SOP Creator with Screenshots & Training Modules",
    description: "Transform your business processes into professional SOPs with screenshots, annotations, and interactive training. Export to PDF/HTML. Free tier available - start creating today!",
    keywords: "SOP creator, standard operating procedures, business documentation, process documentation, workflow management, training modules, PDF export, screenshot annotation",
    ogType: "website",
    schemaMarkup: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "SOPify",
      "applicationCategory": "BusinessApplication",
      "description": "Professional SOP creation tool with screenshots and training modules",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "operatingSystem": "Web Browser",
      "url": "https://sopify.app"
    }
  },
  "/app": {
    title: "SOPify App - Create Your SOPs | SOP Builder Tool",
    description: "Use SOPify's intuitive SOP builder to create step-by-step procedures with screenshots. Add annotations, export to PDF, and share with your team instantly.",
    keywords: "SOP builder, create SOPs, procedure builder, step-by-step documentation, business process creation",
    ogType: "webapp"
  },
  "/auth": {
    title: "Sign Up for SOPify - Start Creating Professional SOPs",
    description: "Join thousands of businesses using SOPify to create professional Standard Operating Procedures. Sign up free and start building SOPs in minutes.",
    keywords: "SOPify signup, register SOP tool, free SOP creator account, business documentation signup"
  },
  "/privacy-policy": {
    title: "Privacy Policy - SOPify | How We Protect Your Data",
    description: "Learn how SOPify protects your privacy and handles your data. Read our comprehensive privacy policy covering data collection, usage, and your rights.",
    keywords: "SOPify privacy policy, data protection, user privacy, GDPR compliance"
  },
  "/terms-of-service": {
    title: "Terms of Service - SOPify | User Agreement & Guidelines",
    description: "Review SOPify's terms of service, user agreement, and guidelines. Understand your rights and responsibilities when using our SOP creation platform.",
    keywords: "SOPify terms of service, user agreement, terms and conditions, service guidelines"
  },
  "/cookie-policy": {
    title: "Cookie Policy - SOPify | How We Use Cookies",
    description: "Learn about SOPify's cookie usage, types of cookies we use, and how to manage your cookie preferences for an optimal user experience.",
    keywords: "SOPify cookie policy, website cookies, cookie management, privacy settings"
  }
};

export const generateSchemaMarkup = (type: string, data: any) => {
  const schemas: Record<string, object> = {
    faq: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": data
    },
    article: {
      "@context": "https://schema.org",
      "@type": "Article",
      ...data
    },
    breadcrumb: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": data
    }
  };
  
  return schemas[type] || {};
};
