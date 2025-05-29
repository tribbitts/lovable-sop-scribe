// Quick Debug Script - Paste in Browser Console
console.log('🔍 QUICK DEBUG: Checking export format state...');

// Check if the enhanced option exists in DOM
const enhancedRadio = document.querySelector('input[value="enhanced-html"]');
console.log('Enhanced HTML radio button found:', !!enhancedRadio);

if (enhancedRadio) {
  console.log('✅ Enhanced option IS in DOM');
  console.log('Disabled:', enhancedRadio.disabled);
  console.log('Hidden:', enhancedRadio.style.display);
  
  // Check parent container
  const container = enhancedRadio.closest('div[class*="relative"]');
  if (container) {
    console.log('Container visible:', container.style.display !== 'none');
    console.log('Container opacity:', container.style.opacity || '1');
    console.log('Container classes:', container.className);
  }
} else {
  console.log('❌ Enhanced option NOT in DOM');
  
  // Check what options ARE available
  const allRadios = document.querySelectorAll('input[type="radio"][name]');
  console.log('Available radio options:', Array.from(allRadios).map(r => r.value));
  
  // Look for any mentions of "Training" or "enhanced"
  const trainingText = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.toLowerCase().includes('training')
  );
  console.log('Found Training text:', !!trainingText);
  
  // Check console for export format debug logs
  console.log('🔍 Look for debug logs starting with "🔍 Export Format Selector Debug"');
}

// Also check subscription context
const authToken = localStorage.getItem('sb-vymlbmtrvwbkphqaxmly-auth-token');
if (authToken) {
  try {
    const authData = JSON.parse(authToken);
    console.log('Current user:', authData?.user?.email);
  } catch (e) {
    console.log('Could not parse auth token');
  }
} 