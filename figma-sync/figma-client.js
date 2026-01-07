/**
 * Figma API Client
 * Direct integration with Figma REST API for fetching design files
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Figma API token
const configPath = path.join(__dirname, '..', '.figma-config');
const config = fs.readFileSync(configPath, 'utf-8')
  .split('\n')
  .filter(line => line.startsWith('FIGMA_'))
  .reduce((acc, line) => {
    const [key, value] = line.split('=');
    acc[key] = value;
    return acc;
  }, {});

const FIGMA_API_TOKEN = config.FIGMA_API_TOKEN;
const FIGMA_API_BASE = 'api.figma.com';

/**
 * Make authenticated request to Figma API
 */
function figmaRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: FIGMA_API_BASE,
      path: `/v1/${endpoint}`,
      method: 'GET',
      headers: {
        'X-Figma-Token': FIGMA_API_TOKEN
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Figma API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Get user's Figma files
 */
export async function getUserFiles() {
  try {
    const data = await figmaRequest('me');
    console.log('✅ Connected to Figma API');
    console.log(`📧 User: ${data.email}`);
    console.log(`👤 Name: ${data.handle}`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching user info:', error.message);
    throw error;
  }
}

/**
 * Get file details by file key
 */
export async function getFile(fileKey) {
  try {
    const data = await figmaRequest(`files/${fileKey}`);
    console.log(`✅ Fetched file: ${data.name}`);
    console.log(`📅 Last modified: ${data.lastModified}`);
    console.log(`📄 Version: ${data.version}`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching file ${fileKey}:`, error.message);
    throw error;
  }
}

/**
 * Get file nodes (specific frames/components)
 */
export async function getFileNodes(fileKey, nodeIds) {
  try {
    const idsParam = nodeIds.join(',');
    const data = await figmaRequest(`files/${fileKey}/nodes?ids=${idsParam}`);
    console.log(`✅ Fetched ${Object.keys(data.nodes).length} nodes from file`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching nodes:`, error.message);
    throw error;
  }
}

/**
 * Get file styles (colors, text styles)
 */
export async function getFileStyles(fileKey) {
  try {
    const data = await figmaRequest(`files/${fileKey}/styles`);
    console.log(`✅ Fetched styles from file`);
    console.log(`🎨 Color styles: ${Object.keys(data.meta.styles).filter(s => s.includes('FILL')).length}`);
    console.log(`✍️  Text styles: ${Object.keys(data.meta.styles).filter(s => s.includes('TEXT')).length}`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching styles:`, error.message);
    throw error;
  }
}

/**
 * Get file components
 */
export async function getFileComponents(fileKey) {
  try {
    const data = await figmaRequest(`files/${fileKey}/components`);
    console.log(`✅ Fetched components from file`);
    console.log(`🧩 Components found: ${Object.keys(data.meta.components).length}`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching components:`, error.message);
    throw error;
  }
}

/**
 * Get image URLs for nodes
 */
export async function getImages(fileKey, nodeIds, options = {}) {
  try {
    const idsParam = nodeIds.join(',');
    const format = options.format || 'png';
    const scale = options.scale || 2;

    const data = await figmaRequest(`images/${fileKey}?ids=${idsParam}&format=${format}&scale=${scale}`);
    console.log(`✅ Generated ${Object.keys(data.images).length} image URLs`);
    return data;
  } catch (error) {
    console.error(`❌ Error generating images:`, error.message);
    throw error;
  }
}

/**
 * Extract design tokens from file
 */
export async function extractDesignTokens(fileKey) {
  console.log('\n🎨 Extracting design tokens from Figma...\n');

  const file = await getFile(fileKey);
  const tokens = {
    colors: {},
    typography: {},
    spacing: {},
    effects: {}
  };

  // Extract colors from fills
  function extractColors(node, path = '') {
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach((fill, idx) => {
        if (fill.type === 'SOLID' && fill.color) {
          const name = node.name || `color-${path}-${idx}`;
          const color = fill.color;
          tokens.colors[name] = {
            r: Math.round(color.r * 255),
            g: Math.round(color.g * 255),
            b: Math.round(color.b * 255),
            a: color.a || 1
          };
        }
      });
    }

    if (node.children) {
      node.children.forEach((child, idx) => {
        extractColors(child, `${path}/${child.name || idx}`);
      });
    }
  }

  // Extract typography from text nodes
  function extractTypography(node) {
    if (node.type === 'TEXT' && node.style) {
      const name = node.name || 'text-style';
      tokens.typography[name] = {
        fontFamily: node.style.fontFamily,
        fontSize: node.style.fontSize,
        fontWeight: node.style.fontWeight,
        lineHeight: node.style.lineHeightPx,
        letterSpacing: node.style.letterSpacing
      };
    }

    if (node.children) {
      node.children.forEach(child => extractTypography(child));
    }
  }

  // Parse document
  if (file.document) {
    extractColors(file.document);
    extractTypography(file.document);
  }

  console.log(`✅ Extracted ${Object.keys(tokens.colors).length} colors`);
  console.log(`✅ Extracted ${Object.keys(tokens.typography).length} text styles`);

  return tokens;
}

// Export for use in other scripts
export default {
  getUserFiles,
  getFile,
  getFileNodes,
  getFileStyles,
  getFileComponents,
  getImages,
  extractDesignTokens
};
