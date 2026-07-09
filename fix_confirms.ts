import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('src/**/*.{ts,tsx}');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('window.confirm')) {
    content = content.replace(/if \(!window\.confirm\([^)]+\)\) return;/g, '');
    content = content.replace(/if \(!window\.confirm\([^)]+\)\) \{\s*return;\s*\}/g, '');
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
