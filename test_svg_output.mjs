// test_svg_output.mjs
// UnDotum composite glyph 분해 → SVG 생성 검증

import { readFileSync, writeFileSync } from 'fs';

// opentype.js 로드
const { default: opentype } = await import('./node_modules/opentype.js/dist/opentype.mjs').catch(async () => {
  const opentypeModule = await import('./node_modules/opentype.js/dist/opentype.js');
  return opentypeModule;
});

const buf = readFileSync('./UnDotum.ttf');
const font = opentype.parse(buf.buffer);

const FONT_SIZE = 200;

const testWords = [
  { char: '한', colors: { choseong: '#E53E3E', jungseong: '#3182CE', jongseong: '#38A169' } },
  { char: '가', colors: { choseong: '#FF6B6B', jungseong: '#4ECDC4', jongseong: '#FFE66D' } },
  { char: '글', colors: { choseong: '#9B59B6', jungseong: '#2ECC71', jongseong: '#F39C12' } },
  { char: '닭', colors: { choseong: '#E74C3C', jungseong: '#3498DB', jongseong: '#1ABC9C' } },
  { char: '뷁', colors: { choseong: '#FF0090', jungseong: '#00FF88', jongseong: '#00CFFF' } },
];

function getColorType(componentIndex, totalComponents) {
  if (totalComponents === 2) {
    return componentIndex === 0 ? 'choseong' : 'jungseong';
  }
  if (componentIndex === 0) return 'choseong';
  if (componentIndex === totalComponents - 1) return 'jongseong';
  return 'jungseong';
}

function buildSVG(char, colors, outputSize = 300) {
  const glyph = font.charToGlyph(char);
  console.log(`\n'${char}': isComposite=${glyph.numberOfContours === -1}, components=${glyph.components?.length}`);
  
  if (glyph.numberOfContours !== -1 || !glyph.components?.length) {
    const path = glyph.getPath(0, FONT_SIZE, FONT_SIZE);
    const bb = path.getBoundingBox();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${outputSize}" height="${outputSize}" viewBox="${bb.x1} ${bb.y1} ${bb.x2-bb.x1} ${bb.y2-bb.y1}">
  <path fill="${colors.choseong}" d="${path.toPathData(3)}"/>
</svg>`;
  }
  
  const colorMap = { choseong: colors.choseong, jungseong: colors.jungseong, jongseong: colors.jongseong };
  const n = glyph.components.length;
  
  // 전체 bounding box 계산
  const fullPath = glyph.getPath(0, FONT_SIZE, FONT_SIZE);
  const bb = fullPath.getBoundingBox();
  const pad = FONT_SIZE * 0.04;
  const vx = (bb.x1 - pad).toFixed(1);
  const vy = (bb.y1 - pad).toFixed(1);
  const vw = (bb.x2 - bb.x1 + pad * 2).toFixed(1);
  const vh = (bb.y2 - bb.y1 + pad * 2).toFixed(1);

  const paths = glyph.components.map((comp, i) => {
    const type = getColorType(i, n);
    const childGlyph = font.glyphs.get(comp.glyphIndex);
    const path = childGlyph.getPath(0, FONT_SIZE, FONT_SIZE);
    const pd = path.toPathData(3);
    console.log(`  comp[${i}] type=${type} glyphIndex=${comp.glyphIndex} name=${childGlyph.name} pathLen=${pd.length}`);
    return `  <path fill="${colorMap[type]}" d="${pd}"/>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${outputSize}" height="${outputSize}" viewBox="${vx} ${vy} ${vw} ${vh}">
  <!-- ${char} 초성:${colors.choseong} 중성:${colors.jungseong} 종성:${colors.jongseong} -->
${paths}
</svg>`;
}

for (const { char, colors } of testWords) {
  const svg = buildSVG(char, colors);
  const filename = `test_output_${char}.svg`;
  writeFileSync(filename, svg, 'utf8');
  console.log(`  → 저장: ${filename}`);
}

console.log('\n✅ SVG 파일 생성 완료! test_output_*.svg 파일을 브라우저로 열어 확인하세요.');
