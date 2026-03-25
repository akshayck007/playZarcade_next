import fs from 'fs';
import path from 'path';

const romsDir = path.join(process.cwd(), 'public', 'roms');
const manifestPath = path.join(process.cwd(), 'public', 'roms-manifest.json');

console.log('Generating ROMs manifest...');

if (!fs.existsSync(romsDir)) {
  console.log('No ROMs directory found. Creating empty manifest.');
  fs.writeFileSync(manifestPath, JSON.stringify({ files: [] }, null, 2));
  process.exit(0);
}

const files = fs.readdirSync(romsDir)
  .filter(file => !file.startsWith('.'))
  .map(file => {
    const ext = path.extname(file).toLowerCase();
    const title = file.replace(ext, '')
      .replace(/\(.*\)/g, '')
      .replace(/\[.*\]/g, '')
      .trim();
    
    return {
      filename: file,
      title,
      url: `/roms/${file}`,
      extension: ext.replace('.', '')
    };
  });

fs.writeFileSync(manifestPath, JSON.stringify({ files }, null, 2));
console.log(`Manifest generated with ${files.length} files.`);
