const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

walkDir('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content.replace(/text-gray-500/g, 'text-gray-700');
  content = content.replace(/text-gray-400/g, 'text-gray-600');
  content = content.replace(/text-gray-600/g, 'text-gray-800'); // To maintain hierarchy if 600 was used
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
});
