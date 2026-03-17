#!/usr/bin/env node
/**
 * FRS Bulk QR Code Generator
 * 
 * Generates QR codes for multiple profiles and saves them to a directory.
 * Usage: node bulk-generate-qr.js <slugs-file> [output-dir]
 * 
 * The slugs file should have one slug per line.
 * Output defaults to ./qr-output/
 */

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const MODULE_SIZE = 8;
const CORNER_RADIUS = 3.2;
const GRADIENT_START = '#2dd4da';
const GRADIENT_END = '#2563eb';
const BASE_URL = 'https://21stcenturylending.com/lo/';

async function generateStyledQR(url) {
  const qrData = await QRCode.create(url, {
    errorCorrectionLevel: 'M',
    margin: 0,
  });

  const modules = qrData.modules;
  const size = modules.size;
  const svgSize = size * MODULE_SIZE;

  let rects = '';

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules.get(x, y)) {
        const px = x * MODULE_SIZE;
        const py = y * MODULE_SIZE;
        rects += `<rect x="${px}" y="${py}" width="${MODULE_SIZE}" height="${MODULE_SIZE}" rx="${CORNER_RADIUS}" ry="${CORNER_RADIUS}" fill="url(#qrGrad)"/>`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}">
<defs>
    <linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${GRADIENT_START}"/>
        <stop offset="100%" style="stop-color:${GRADIENT_END}"/>
    </linearGradient>
</defs>${rects}
</svg>`;

  return svg;
}

async function main() {
  const slugsFile = process.argv[2];
  const outputDir = process.argv[3] || './qr-output';

  if (!slugsFile) {
    console.error('Usage: node bulk-generate-qr.js <slugs-file> [output-dir]');
    console.error('');
    console.error('The slugs file should have one slug per line.');
    console.error('Example: echo "john-doe\\njane-smith" > slugs.txt && node bulk-generate-qr.js slugs.txt');
    process.exit(1);
  }

  // Read slugs from file
  if (!fs.existsSync(slugsFile)) {
    console.error(`Error: File not found: ${slugsFile}`);
    process.exit(1);
  }

  const slugs = fs.readFileSync(slugsFile, 'utf8')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('#'));

  if (slugs.length === 0) {
    console.error('Error: No slugs found in file');
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generating ${slugs.length} QR codes...`);
  console.log(`Output directory: ${path.resolve(outputDir)}`);
  console.log('');

  let success = 0;
  let failed = 0;

  for (const slug of slugs) {
    const url = `${BASE_URL}${slug}/`;
    const outputFile = path.join(outputDir, `${slug}.svg`);

    try {
      const svg = await generateStyledQR(url);
      fs.writeFileSync(outputFile, svg);
      console.log(`✓ ${slug} → ${url}`);
      success++;
    } catch (error) {
      console.error(`✗ ${slug}: ${error.message}`);
      failed++;
    }
  }

  console.log('');
  console.log(`Done! Generated: ${success}, Failed: ${failed}`);
  console.log(`Files saved to: ${path.resolve(outputDir)}`);
}

main();
