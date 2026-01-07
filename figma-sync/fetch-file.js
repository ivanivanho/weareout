#!/usr/bin/env node
/**
 * Fetch WeAreOut Figma Design File
 * Retrieves the complete design file and analyzes its structure
 */

import { getFile, getFileComponents, extractDesignTokens } from './figma-client.js';
import fs from 'fs';
import path from 'path';

// WeAreOut Figma file key from URL
const FILE_KEY = 'Ab967Qn4tDrvhHpOHdaT48';
const FILE_NAME = 'WeAreOut App Interface Design';

console.log('🎨 Fetching WeAreOut Figma Design File...\n');
console.log('═'.repeat(70));
console.log(`\nFile: ${FILE_NAME}`);
console.log(`Key:  ${FILE_KEY}\n`);
console.log('═'.repeat(70));

async function fetchAndAnalyze() {
  try {
    // Fetch the complete file
    console.log('\n📥 Fetching file from Figma API...\n');
    const file = await getFile(FILE_KEY);

    // Save raw file data for reference
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, 'weareout-design-file.json');
    fs.writeFileSync(filePath, JSON.stringify(file, null, 2));
    console.log(`\n💾 Saved complete file data to: ${filePath}\n`);

    // Analyze structure
    console.log('═'.repeat(70));
    console.log('\n📊 FILE STRUCTURE ANALYSIS\n');
    console.log('═'.repeat(70));

    console.log(`\n📄 File Name: ${file.name}`);
    console.log(`🔑 File Key: ${FILE_KEY}`);
    console.log(`📅 Last Modified: ${new Date(file.lastModified).toLocaleString()}`);
    console.log(`🔢 Version: ${file.version}`);

    // Analyze pages
    if (file.document && file.document.children) {
      console.log(`\n📑 Pages: ${file.document.children.length}`);

      file.document.children.forEach((page, idx) => {
        console.log(`\n  Page ${idx + 1}: ${page.name}`);
        console.log(`    Type: ${page.type}`);

        if (page.children) {
          console.log(`    Frames/Sections: ${page.children.length}`);

          // List frames
          page.children.forEach((child, childIdx) => {
            if (childIdx < 10) { // Show first 10
              console.log(`      ${childIdx + 1}. ${child.name} (${child.type})`);

              // If it's a frame, show its children
              if (child.children && child.children.length > 0) {
                console.log(`         └─ ${child.children.length} child elements`);
              }
            }
          });

          if (page.children.length > 10) {
            console.log(`      ... and ${page.children.length - 10} more frames`);
          }
        }
      });
    }

    // Analyze components
    console.log('\n\n═'.repeat(70));
    console.log('\n🧩 COMPONENTS ANALYSIS\n');
    console.log('═'.repeat(70));

    try {
      const components = await getFileComponents(FILE_KEY);

      if (components.meta && components.meta.components) {
        const componentList = Object.values(components.meta.components);
        console.log(`\n✅ Found ${componentList.length} components\n`);

        componentList.slice(0, 15).forEach((comp, idx) => {
          console.log(`  ${idx + 1}. ${comp.name}`);
          console.log(`     └─ Key: ${comp.key}`);
        });

        if (componentList.length > 15) {
          console.log(`\n  ... and ${componentList.length - 15} more components`);
        }
      }
    } catch (error) {
      console.log(`\n⚠️  Could not fetch components: ${error.message}`);
    }

    // Extract design tokens
    console.log('\n\n═'.repeat(70));
    console.log('\n🎨 DESIGN SYSTEM EXTRACTION\n');
    console.log('═'.repeat(70));

    const tokens = await extractDesignTokens(FILE_KEY);

    // Save design tokens
    const tokensPath = path.join(outputDir, 'design-tokens.json');
    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
    console.log(`\n💾 Saved design tokens to: ${tokensPath}`);

    // Summary
    console.log('\n\n═'.repeat(70));
    console.log('\n✅ FETCH COMPLETE!\n');
    console.log('═'.repeat(70));
    console.log('\n📁 Generated Files:');
    console.log(`   • ${filePath}`);
    console.log(`   • ${tokensPath}`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Review the design structure above');
    console.log('   2. I\'ll generate React Native screens from these designs');
    console.log('   3. Extract and apply the design system');
    console.log('   4. Build the complete iOS app\n');

    return { file, tokens };

  } catch (error) {
    console.error('\n❌ Error fetching Figma file:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
}

fetchAndAnalyze();
