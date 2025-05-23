// Simple test to verify HTML export includes tags and resources
import { generateHtml } from './src/lib/html-export/index.ts';

const testDocument = {
  title: "Test SOP",
  topic: "Testing",
  date: "2024-01-01",
  logo: null,
  companyName: "Test Company",
  steps: [
    {
      id: "1",
      title: "Test Step",
      description: "This is a test step",
      detailedInstructions: "Follow these detailed instructions",
      notes: "Important notes here",
      tags: ["important", "testing", "first-step"],
      resources: [
        {
          id: "res1",
          type: "link",
          title: "Test Link",
          url: "https://example.com",
          description: "A helpful test link"
        },
        {
          id: "res2", 
          type: "file",
          title: "Test Document",
          url: "/path/to/file.pdf",
          description: "Important document"
        }
      ],
      screenshot: {
        id: "shot1",
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        callouts: []
      },
      completed: false
    }
  ],
  tableOfContents: true,
  darkMode: false,
  progressTracking: { enabled: false }
};

console.log("Testing HTML export with tags and resources...");
const html = generateHtml(testDocument);

// Check if tags are included
if (html.includes('class="step-tags"') && html.includes('important') && html.includes('testing')) {
  console.log("✅ Tags are properly included in HTML export");
} else {
  console.log("❌ Tags are missing from HTML export");
}

// Check if resources are included  
if (html.includes('class="step-resources"') && html.includes('Test Link') && html.includes('Test Document')) {
  console.log("✅ Resources are properly included in HTML export");
} else {
  console.log("❌ Resources are missing from HTML export");
}

// Check if resource icons are included
if (html.includes('🔗') && html.includes('📄')) {
  console.log("✅ Resource type icons are included");
} else {
  console.log("❌ Resource type icons are missing");
}

console.log("HTML export test completed!"); 