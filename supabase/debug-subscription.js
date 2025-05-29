// Debug script to check subscription status
// Add this temporarily to the browser console when on the SOP Creator page

console.log('=== SUBSCRIPTION DEBUG ===');

// Check if user is logged in
const userElement = document.querySelector('[data-user-email]') || 
                   document.querySelector('.user-email') ||
                   document.querySelector('[class*="email"]');

if (userElement) {
  console.log('Found user element:', userElement.textContent);
}

// Check localStorage for subscription data
console.log('Local Storage Data:');
console.log('- sop_daily_pdf_exports:', localStorage.getItem('sop_daily_pdf_exports'));
console.log('- sop_daily_html_exports:', localStorage.getItem('sop_daily_html_exports'));
console.log('- sop_last_export_date:', localStorage.getItem('sop_last_export_date'));

// Check for auth tokens
console.log('Supabase Auth:');
console.log('- supabase auth token exists:', !!localStorage.getItem('sb-vymlbmtrvwbkphqaxmly-auth-token'));

// Check React Dev Tools for user data
if (window.React) {
  console.log('React DevTools available - check Components tab for AuthContext and SubscriptionContext');
}

console.log('=== DEBUG COMPLETE ===');
console.log('Instructions:');
console.log('1. Open React DevTools');
console.log('2. Go to Components tab');
console.log('3. Find AuthContext.Provider and check user.email');
console.log('4. Find SubscriptionContext.Provider and check tier/isAdmin values'); 