#!/usr/bin/env node
/**
 * Patches metro-config for Node.js 18 compatibility with Expo SDK 54
 * Replaces .toReversed() with [...arr].reverse()
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', 'metro-config', 'src', 'loadConfig.js');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace toReversed() calls with spread+reverse
  content = content.replace(/configs\.toReversed\(\)/g, '[...configs].reverse()');
  content = content.replace(/reversedConfigs\.toReversed\(\)/g, '[...reversedConfigs].reverse()');
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Patched metro-config for Node.js 18 compatibility');
} else {
  console.log('⚠️ metro-config not found, skipping patch');
}

