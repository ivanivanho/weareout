#!/usr/bin/env node
/**
 * Test Figma API Connection
 * Verifies that the Figma API token is working and shows available files
 */

import { getUserFiles } from './figma-client.js';

console.log('🔍 Testing Figma API Connection...\n');
console.log('═'.repeat(60));

async function testConnection() {
  try {
    const userData = await getUserFiles();

    console.log('\n✅ SUCCESS! Figma API is connected and working!\n');
    console.log('═'.repeat(60));
    console.log('\n📊 Your Figma Account Info:\n');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Handle: ${userData.handle}`);
    console.log(`   ID: ${userData.id}`);

    console.log('\n═'.repeat(60));
    console.log('\n🎉 Figma integration is ready to use!\n');
    console.log('Next steps:');
    console.log('  1. Share your WeAreOut Figma file URL');
    console.log('  2. I\'ll extract the design system and components');
    console.log('  3. Generate React Native code from your designs\n');

  } catch (error) {
    console.log('\n❌ FAILED! Could not connect to Figma API\n');
    console.log('═'.repeat(60));
    console.error('\nError:', error.message);
    console.log('\nPlease check:');
    console.log('  - API token is correct in .figma-config');
    console.log('  - Token has not expired (90-day validity)');
    console.log('  - Internet connection is working\n');
    process.exit(1);
  }
}

testConnection();
