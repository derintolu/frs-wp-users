#!/usr/bin/env node
/**
 * FRS QR Code Generator - Generates styled SVG QR codes matching brand guidelines
 */

const QRCode = require('qrcode');

const MODULE_SIZE = 8;
const CORNER_RADIUS = 3.2;
const GRADIENT_START = '#2dd4da';
const GRADIENT_END = '#2563eb';

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
  const url = process.argv[2];

  if (!url) {
    console.error('Usage: node generate-qr.js <url>');
    process.exit(1);
  }

  try {
    const svg = await generateStyledQR(url);
    console.log(svg);
  } catch (error) {
    console.error('Error generating QR code:', error.message);
    process.exit(1);
  }
}

main();
