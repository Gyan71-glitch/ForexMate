const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files
const files = execSync('find /Users/gyanvaibhav/Desktop/forex/Forexmate-v2/frontend/src -type f -name "*.ts" -o -name "*.tsx"').toString().trim().split('\n');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace localStorage.getItem/setItem/removeItem with sessionStorage for specific keys
  content = content.replace(/localStorage\.getItem\(['"]forexmate_token['"]\)/g, "sessionStorage.getItem('forexmate_token')");
  content = content.replace(/localStorage\.setItem\(['"]forexmate_token['"]/g, "sessionStorage.setItem('forexmate_token'");
  content = content.replace(/localStorage\.removeItem\(['"]forexmate_token['"]\)/g, "sessionStorage.removeItem('forexmate_token')");
  
  content = content.replace(/localStorage\.getItem\(['"]forexmate_user['"]\)/g, "sessionStorage.getItem('forexmate_user')");
  content = content.replace(/localStorage\.setItem\(['"]forexmate_user['"]/g, "sessionStorage.setItem('forexmate_user'");
  content = content.replace(/localStorage\.removeItem\(['"]forexmate_user['"]\)/g, "sessionStorage.removeItem('forexmate_user')");

  // If api.ts, remove the monkey patch block
  if (file.endsWith('api.ts')) {
    content = content.replace(/if \(typeof window !== 'undefined'\) \{[\s\S]*?\} catch \(e\) \{\}[\s\S]*?\}/, '');
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
console.log('Done');
