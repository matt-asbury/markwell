const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const svgPath = path.join(assetsDir, 'icon.svg');
const pngPath = path.join(assetsDir, 'icon.png');

async function build() {
  try {
    const sharp = require('sharp');
    const svg = fs.readFileSync(svgPath);
    await sharp(svg).resize(1024, 1024).png().toFile(pngPath);
    console.log('Built assets/icon.png');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND' || err.code === 'ENOENT') {
      console.warn('Skipping icon: sharp not installed or assets/icon.svg missing. Run npm install for app icon.');
      process.exit(0);
    }
    throw err;
  }
}

build();
