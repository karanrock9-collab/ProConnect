
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing ESM import from authAction...');

const authActionIndexPath = path.join(__dirname, 'src', 'config', 'redux', 'action', 'authAction', 'index.js');
console.log('authAction file path:', authActionIndexPath);

// Now let's create a temp test file that imports
const tempFileContent = `
import { clientServer } from '../../../index.js';
console.log('✅ Imported clientServer successfully!');
console.log('clientServer exists:', typeof clientServer === 'object');
`;

const tempTestFile = path.join(__dirname, 'temp-esm-test.js');
import fs from 'fs';
fs.writeFileSync(tempTestFile, tempFileContent);

console.log('\nTemp test file created at:', tempTestFile);
console.log('Temp file contents:', fs.readFileSync(tempTestFile, 'utf8'));

// Now we need to be in authAction directory when we import
process.chdir(path.dirname(authActionIndexPath));
console.log('\nCurrent directory:', process.cwd());

try {
  // Dynamic import the temp file
  const tempTestFileUrl = 'file:///' + tempTestFile.replace(/\\/g, '/');
  console.log('Importing temp test file from:', tempTestFileUrl);
  await import(tempTestFileUrl);
  console.log('\n✅ All tests passed!');
} catch (err) {
  console.error('\n❌ Error:', err);
  console.error('Stack:', err.stack);
} finally {
  // Clean up temp file
  fs.unlinkSync(tempTestFile);
  console.log('\nTemp file deleted');
}
