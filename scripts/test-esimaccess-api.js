#!/usr/bin/env node

/**
 * eSIM Access API Testing Script
 * 
 * Usage:
 *   ESIMACCESS_ACCESS_CODE=your_code node test-esimaccess-api.js
 * 
 * Or set in .env.local (Next.js will load it automatically if running in Next.js context)
 * For standalone script, export the variable:
 *   export ESIMACCESS_ACCESS_CODE=your_code
 *   node test-esimaccess-api.js
 */

// Try to load .env.local if dotenv is available (optional)
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not available, use environment variables directly
}

const ACCESS_CODE = process.env.ESIMACCESS_ACCESS_CODE;
const BASE_URL = process.env.ESIMACCESS_BASE_URL || 'https://api.esimaccess.com/api/v1/open';

if (!ACCESS_CODE) {
  console.error('❌ ESIMACCESS_ACCESS_CODE not set in environment variables');
  console.error('   Set it in .env.local or export it:');
  console.error('   export ESIMACCESS_ACCESS_CODE=your_code');
  process.exit(1);
}

async function testEndpoint(name, path, body = {}) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`   Endpoint: ${BASE_URL}${path}`);
  console.log(`   Body: ${JSON.stringify(body)}`);
  
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ACCESS_CODE,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const text = await res.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error(`❌ Invalid JSON response:`, text);
      return { success: false, error: 'Invalid JSON' };
    }
    
    console.log(`   Status: ${res.status}`);
    
    if (data.success === false || data.errorCode !== "0") {
      console.error(`❌ Error Code: ${data.errorCode}`);
      console.error(`   Error Message: ${data.errorMsg || 'Unknown error'}`);
      return { success: false, error: data.errorMsg || data.errorCode, data };
    }
    
    console.log(`✅ Success!`);
    console.log(`   Response structure:`, Object.keys(data.obj || data));
    
    // Pretty print response (truncated)
    const responseStr = JSON.stringify(data, null, 2);
    if (responseStr.length > 500) {
      console.log(`   Response (first 500 chars):`, responseStr.substring(0, 500) + '...');
    } else {
      console.log(`   Response:`, responseStr);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting eSIM Access API Tests');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Access Code: ${ACCESS_CODE.substring(0, 8)}...`);
  
  const results = {
    balance: false,
    packages: false,
    order: false,
    query: false,
  };
  
  // Test 1: Balance Query (known working endpoint)
  console.log('\n' + '='.repeat(60));
  const balanceResult = await testEndpoint('Balance Query', '/balance/query', {});
  results.balance = balanceResult.success;
  
  if (!balanceResult.success) {
    console.error('\n❌ Balance query failed - check your ACCESS_CODE');
    console.error('   Cannot proceed with other tests.');
    return;
  }
  
  // Test 2: Package List
  console.log('\n' + '='.repeat(60));
  const packagesResult = await testEndpoint('Package List (Saudi Arabia)', '/package/list', { country: 'SA' });
  results.packages = packagesResult.success;
  
  let testPackageCode = null;
  if (packagesResult.success && packagesResult.data) {
    const packages = packagesResult.data.obj?.packageList || 
                     packagesResult.data.packageList || 
                     (Array.isArray(packagesResult.data.obj) ? packagesResult.data.obj : []) ||
                     (Array.isArray(packagesResult.data) ? packagesResult.data : []);
    
    if (packages.length > 0) {
      testPackageCode = packages[0].packageCode || packages[0].slug || packages[0].id;
      console.log(`\n   📦 Found ${packages.length} packages`);
      console.log(`   Test package code: ${testPackageCode}`);
      
      // Show first package details
      const firstPkg = packages[0];
      console.log(`   First package:`);
      console.log(`     - Name: ${firstPkg.name || firstPkg.packageName || 'N/A'}`);
      console.log(`     - Price: ${firstPkg.price ? (firstPkg.price / 10000).toFixed(2) : 'N/A'}`);
      console.log(`     - Data: ${firstPkg.dataGB || 'N/A'}GB`);
      console.log(`     - Duration: ${firstPkg.durationDays || 'N/A'} days`);
    } else {
      console.log(`   ⚠️  No packages found in response`);
    }
  }
  
  // Test 3: Order eSIM (if we have a package code)
  if (testPackageCode) {
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  Order test will create a REAL order and charge your account!');
    console.log('   Skipping order test. To test manually, use:');
    console.log(`   curl -X POST '${BASE_URL}/esim/order/profiles' \\`);
    console.log(`     -H 'RT-AccessCode: ${ACCESS_CODE.substring(0, 8)}...' \\`);
    console.log(`     -H 'Content-Type: application/json' \\`);
    console.log(`     -d '{"packageCode": "${testPackageCode}", "transactionId": "test_${Date.now()}"}'`);
    results.order = 'skipped';
  } else {
    console.log('\n⚠️  Cannot test order - no package code available');
    results.order = 'skipped';
  }
  
  // Test 4: Query Profiles (requires orderNo from a real order)
  console.log('\n' + '='.repeat(60));
  console.log('⚠️  Query test requires a real orderNo/esimTranNo');
  console.log('   Skipping query test. To test manually after creating an order:');
  console.log(`   curl -X POST '${BASE_URL}/esim/query' \\`);
  console.log(`     -H 'RT-AccessCode: ${ACCESS_CODE.substring(0, 8)}...' \\`);
  console.log(`     -H 'Content-Type: application/json' \\`);
  console.log(`     -d '{"orderNo": "B25091113270004"}'`);
  results.query = 'skipped';
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:');
  console.log(`   Balance Query: ${results.balance ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Package List: ${results.packages ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Order eSIM: ${results.order === 'skipped' ? '⏭️  SKIPPED' : results.order ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Query Profiles: ${results.query === 'skipped' ? '⏭️  SKIPPED' : results.query ? '✅ PASS' : '❌ FAIL'}`);
  
  if (results.balance && results.packages) {
    console.log('\n✅ Core endpoints are working!');
    console.log('   Next steps:');
    console.log('   1. Test order creation manually (will charge account)');
    console.log('   2. Test query profiles with real orderNo');
    console.log('   3. Run end-to-end test in application');
  } else {
    console.log('\n❌ Some tests failed. Check:');
    console.log('   1. ACCESS_CODE is correct');
    console.log('   2. Account has sufficient balance');
    console.log('   3. Endpoint paths are correct');
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test script error:', error);
  process.exit(1);
});

