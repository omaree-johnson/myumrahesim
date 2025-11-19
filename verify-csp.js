#!/usr/bin/env node

/**
 * Script to verify CSP headers are correctly configured
 * Run this after deployment to verify the CSP includes all required domains
 */

const requiredDomains = {
  'script-src': [
    'https://clerk.myumrahesim.com',
    'https://*.myumrahesim.com',
    'https://js.stripe.com',
    'https://*.stripe.com'
  ],
  'connect-src': [
    'https://clerk.myumrahesim.com',
    'https://*.myumrahesim.com',
    'https://api.exchangerate-api.com',
    'https://*.stripe.com'
  ],
  'frame-src': [
    'https://clerk.myumrahesim.com',
    'https://*.myumrahesim.com',
    'https://js.stripe.com',
    'https://hooks.stripe.com'
  ]
};

console.log('🔍 CSP Verification Checklist\n');
console.log('After deployment, check the Response Headers for Content-Security-Policy:\n');

Object.entries(requiredDomains).forEach(([directive, domains]) => {
  console.log(`\n${directive}:`);
  domains.forEach(domain => {
    console.log(`  ✅ Should include: ${domain}`);
  });
});

console.log('\n\n📋 Quick Test:');
console.log('1. Open DevTools → Network tab');
console.log('2. Reload the page');
console.log('3. Click on the main document request');
console.log('4. Check Response Headers → Content-Security-Policy');
console.log('5. Verify all domains above are present\n');

console.log('🚨 If domains are missing:');
console.log('  - The deployment may not have completed');
console.log('  - Clear CDN/proxy cache if applicable');
console.log('  - Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)');
console.log('  - Check deployment logs for errors\n');

