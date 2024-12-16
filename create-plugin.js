import { mkdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createPluginZip() {
  const zip = new JSZip();
  const pluginFolder = zip.folder('loopify-integration');

  // Add all plugin files
  const files = {
    'loopify-integration.php': await readFile('loopify-integration/loopify-integration.php'),
    'templates/settings.php': await readFile('loopify-integration/templates/settings.php'),
    'assets/css/admin.css': await readFile('loopify-integration/assets/css/admin.css'),
    'assets/js/admin.js': await readFile('loopify-integration/assets/js/admin.js'),
    'languages/loopify-integration.pot': await readFile('loopify-integration/languages/loopify-integration.pot'),
    'readme.txt': await readFile('loopify-integration/readme.txt')
  };

  // Add each file to the ZIP
  for (const [path, content] of Object.entries(files)) {
    pluginFolder.file(path, content);
  }

  // Generate ZIP file
  const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
  await writeFile('loopify-integration.zip', zipContent);

  console.log('Plugin ZIP file created successfully! You can find it at loopify-integration.zip');
}

async function readFile(path) {
  try {
    const response = await fetch(new URL(path, import.meta.url));
    return await response.text();
  } catch (error) {
    console.error(`Error reading file ${path}:`, error);
    throw error;
  }
}

createPluginZip().catch(console.error);