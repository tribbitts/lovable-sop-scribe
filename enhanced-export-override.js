// Enhanced Export Override - Run this in browser console if needed
// This will force the Training Module option to appear

console.log('🔧 Applying Enhanced Export Override...');

// Wait for the page to load, then modify the export options
setTimeout(() => {
  // Find all radio buttons for export formats
  const exportOptions = document.querySelectorAll('input[type="radio"]');
  console.log('Found export options:', exportOptions.length);
  
  // Look for the enhanced-html option specifically
  const enhancedOption = Array.from(exportOptions).find(option => 
    option.value === 'enhanced-html'
  );
  
  if (enhancedOption) {
    console.log('✅ Enhanced HTML option found - it should be visible');
    
    // Make sure it's enabled
    enhancedOption.disabled = false;
    
    // Make sure the parent container is visible
    const container = enhancedOption.closest('div');
    if (container) {
      container.style.display = 'block';
      container.style.opacity = '1';
    }
  } else {
    console.log('❌ Enhanced HTML option NOT found in DOM');
    console.log('Available options:', Array.from(exportOptions).map(o => o.value));
  }
  
  // Also check what the React context values are
  console.log('Current user check (if available):');
  
  // Try to find user info in localStorage
  const authToken = localStorage.getItem('sb-vymlbmtrvwbkphqaxmly-auth-token');
  if (authToken) {
    try {
      const authData = JSON.parse(authToken);
      console.log('User email from auth:', authData?.user?.email);
    } catch (e) {
      console.log('Could not parse auth token');
    }
  }
  
}, 2000);

console.log('🔧 Override script loaded. Check results in 2 seconds...'); 