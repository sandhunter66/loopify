const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create necessary directories
const dirs = [
  'loopify-integration',
  'loopify-integration/assets',
  'loopify-integration/assets/css',
  'loopify-integration/assets/js',
  'loopify-integration/languages',
  'loopify-integration/templates'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Copy all plugin files to their respective directories
const files = {
  'loopify-integration.php': 'loopify-integration/loopify-integration.php',
  'templates/settings.php': 'loopify-integration/templates/settings.php',
  'assets/css/admin.css': 'loopify-integration/assets/css/admin.css',
  'assets/js/admin.js': 'loopify-integration/assets/js/admin.js',
  'languages/loopify-integration.pot': 'loopify-integration/languages/loopify-integration.pot',
  'readme.txt': 'loopify-integration/readme.txt'
};

Object.entries(files).forEach(([src, dest]) => {
  fs.copyFileSync(src, dest);
});

// Create ZIP file
execSync('zip -r loopify-integration.zip loopify-integration/');