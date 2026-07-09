const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('window.confirm')) {
    content = content.replace(/if \(!window\.confirm\([^)]+\)\) return;/g, '');
    content = content.replace(/if \(!window\.confirm\([^)]+\)\) \{[^}]+\}/g, '');
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
