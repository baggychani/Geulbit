// test_glyph.mjs
// UnDotum 폰트에서 한글 복합 글리프 구조 검증

import { readFileSync } from 'fs';

// opentype.js ESM
const opentypeModule = await import('./node_modules/opentype.js/dist/opentype.mjs').catch(async () => {
  // fallback to CJS
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  return require('./node_modules/opentype.js/dist/opentype.js');
});

const opentype = opentypeModule.default || opentypeModule;

const buf = readFileSync('./UnDotum.ttf');
const font = opentype.parse(buf.buffer);

console.log('=== UnDotum 폰트 정보 ===');
console.log('numGlyphs:', font.numGlyphs);
console.log('unitsPerEm:', font.unitsPerEm);

const testChars = ['한', '글', '가', '각', '닭', '뷁', '안'];

for (const char of testChars) {
  const g = font.charToGlyph(char);
  const isComposite = g.numberOfContours === -1;
  
  console.log(`\n=== '${char}' (U+${char.charCodeAt(0).toString(16).toUpperCase()}) ===`);
  console.log('  glyphIndex:', g.index);
  console.log('  numberOfContours:', g.numberOfContours);
  console.log('  isComposite:', isComposite);
  
  if (isComposite && g.components) {
    console.log('  components count:', g.components.length);
    g.components.forEach((c, i) => {
      console.log(`  component[${i}]:`, {
        glyphIndex: c.glyphIndex,
        dx: c.dx,
        dy: c.dy,
        x: c.x,
        y: c.y,
        scaleX: c.scaleX,
        scaleY: c.scaleY,
        matchedPoints: c.matchedPoints,
      });
      // 컴포넌트 글리프도 확인
      const cg = font.glyphs.get(c.glyphIndex);
      if (cg) {
        console.log(`    -> childGlyph ${c.glyphIndex}: numberOfContours=${cg.numberOfContours}, name=${cg.name}`);
      }
    });
  }
}
