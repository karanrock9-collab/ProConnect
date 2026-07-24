
const path = require('path');
const fs = require('fs');

console.log('=== SIMPLE PATH VERIFICATION ===');

// 1. Check config file exists
const configFile = 'c:/Users/KARAN KHAMANKAR/OneDrive/Documents/proconnect/frontend/src/config/index.js';
console.log('1. Config file path:', configFile);
console.log('   Does it exist?', fs.existsSync(configFile));
if (fs.existsSync(configFile)) {
  console.log('   Contents:', fs.readFileSync(configFile, 'utf8'));
}

// 2. Check authAction file
const authActionFile = 'c:/Users/KARAN KHAMANKAR/OneDrive/Documents/proconnect/frontend/src/config/redux/action/authAction/index.js';
console.log('\n2. Auth action file:', authActionFile);
console.log('   Contents first few lines:', fs.readFileSync(authActionFile, 'utf8').split('\n').slice(0, 5).join('\n'));

// 3. Relative path from authActionFile's directory to configFile
const authActionDir = path.dirname(authActionFile);
const relPath = path.relative(authActionDir, configFile);
console.log('\n3. Relative path from authAction directory to config:', relPath);
// Convert to forward slashes and make it relative
const relPathForImport = relPath.replace(/\\/g, '/');
console.log('   For import:', relPathForImport);

// 4. Check if import should be
console.log('   So import should be from:', `'${relPathForImport}'`);
