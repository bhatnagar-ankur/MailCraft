#!/usr/bin/env node
/**
 * Copies non-TypeScript template assets (*.mjml, *.json) from src/ to dist/
 * after tsc compilation.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'templates');
const DEST = path.join(__dirname, '..', 'dist', 'templates');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.name.endsWith('.mjml') || entry.name.endsWith('.json')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(SRC, DEST);
console.log('Assets copied: src/templates → dist/templates');
