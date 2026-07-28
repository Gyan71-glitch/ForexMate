const fs = require('fs');
const path = require('path');

const adminDir = '/Users/gyanvaibhav/Desktop/forex/Forexmate-v2/frontend/src/app/(admin)/admin';
const pages = ['inventory', 'orders', 'rates', 'users']; // rates already done

for (const p of pages) {
  const file = path.join(adminDir, p, 'page.tsx');
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove the aside tag and its content
  content = content.replace(/<aside[\s\S]*?<\/aside>/, '');
  
  // Replace the outer <div className="... flex"> with <div className="p-10 text-gray-900 bg-gray-100 min-h-full">
  content = content.replace(/<div className="[^"]*flex[^"]*">/, '<div className="p-10 text-gray-900 bg-gray-100 min-h-full">');
  
  // Remove the </main> if it exists
  content = content.replace(/<main className="[^"]*">/, '');
  content = content.replace(/<\/main>/, '');
  
  fs.writeFileSync(file, content);
}
console.log('Fixed admin pages');
