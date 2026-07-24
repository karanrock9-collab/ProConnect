
const path = require('path');
const fs = require('fs');

// Test authAction import
console.log('Testing authAction import:');
process.chdir(path.join(__dirname, 'src', 'config', 'redux', 'action', 'authAction'));
try {
  const config = require('../../../index.js');
  console.log('✅ authAction import success!', config.BASE_URL);
} catch (err) {
  console.error('❌ authAction import error:', err);
}

console.log('\nTesting view_profile import:');
process.chdir(path.join(__dirname, 'src', 'pages', 'view_profile'));
try {
  const config = require('../../config/index.js');
  console.log('✅ view_profile import success!', config.BASE_URL);
} catch (err) {
  console.error('❌ view_profile import error:', err);
}

console.log('\nTesting postAction import:');
process.chdir(path.join(__dirname, 'src', 'config', 'redux', 'action', 'postAction'));
try {
  const config = require('../../../index.js');
  console.log('✅ postAction import success!', config.BASE_URL);
} catch (err) {
  console.error('❌ postAction import error:', err);
}

console.log('\nAll imports tested!');
