
import { Helmet } from "react-helmet-async";
import { SEOMetadata, defaultSEO } from "@/lib/seo";

interface SEOHeadProps {
  metadata?: Partial<SEOMetadata>;
  path?: string;
}

const SEOHead = ({ metadata = {}, path = "/" }: SEOHeadProps) => {
  const seo = { ...defaultSEO, ...metadata };
  const canonicalUrl = `https://sopify.app${path}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Social Media */}
      <meta property="og:type" content={seo.ogType || "website"} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.ogImage || "/og-image.png"} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="SOPify" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.ogImage || "/og-image.png"} />
      
      {/* Additional SEO */}
      <meta name="author" content="SOPify" />
      <meta name="language" content="en" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Schema Markup */}
      {seo.schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(seo.schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
