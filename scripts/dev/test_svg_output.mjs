// 프로젝트 루트에서: node scripts/dev/test_svg_output.mjs
// UnDotum composite glyph 분해 → SVG 생성 검증 (출력: scratch/)

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const scratchDir = join(root, 'scratch');
const fontPath = join(root, 'public', 'UnDotum.ttf');
const opentypeMjs = join(root, 'node_modules', 'opentype.js', 'dist', 'opentype.mjs');
const opentypeJs = join(root, 'node_modules', 'opentype.js', 'dist', 'opentype.js');

const { default: opentype } = await import(pathToFileURL(opentypeMjs).href).catch(async () => {
  return import(pathToFileURL(opentypeJs).href);
});

const buf = readFileSync(fontPath);
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
  // UnDotum uses [choseong, jongseong, jungseong] for syllables with a final.
  if (totalComponents === 3) return ['choseong', 'jongseong', 'jungseong'][componentIndex];
  return null;
}

function buildSVG(char, colors, outputSize = 300) {
  const glyph = font.charToGlyph(char);
  // opentype.js fills glyph.components only after resolving the path.
  void glyph.path;
  const isComposite = Array.isArray(glyph.components) && glyph.components.length > 0;
  console.log(`\n'${char}': isComposite=${isComposite}, components=${glyph.components?.length}`);

  if (!isComposite) {
    const path = glyph.getPath(0, FONT_SIZE, FONT_SIZE);
    const bb = path.getBoundingBox();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${outputSize}" height="${outputSize}" viewBox="${bb.x1} ${bb.y1} ${bb.x2 - bb.x1} ${bb.y2 - bb.y1}">
  <path fill="${colors.choseong}" d="${path.toPathData(3)}"/>
</svg>`;
  }

  const colorMap = { choseong: colors.choseong, jungseong: colors.jungseong, jongseong: colors.jongseong };
  const n = glyph.components.length;

  const fullPath = glyph.getPath(0, FONT_SIZE, FONT_SIZE);
  const bb = fullPath.getBoundingBox();
  const pad = FONT_SIZE * 0.04;
  const vx = (bb.x1 - pad).toFixed(1);
  const vy = (bb.y1 - pad).toFixed(1);
  const vw = (bb.x2 - bb.x1 + pad * 2).toFixed(1);
  const vh = (bb.y2 - bb.y1 + pad * 2).toFixed(1);

  const paths = glyph.components
    .map((comp, i) => {
      const type = getColorType(i, n);
      const childGlyph = font.glyphs.get(comp.glyphIndex);
      const path = childGlyph.getPath(0, FONT_SIZE, FONT_SIZE);
      const pd = path.toPathData(3);
      console.log(`  comp[${i}] type=${type} glyphIndex=${comp.glyphIndex} name=${childGlyph.name} pathLen=${pd.length}`);
      return `  <path fill="${colorMap[type]}" d="${pd}"/>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${outputSize}" height="${outputSize}" viewBox="${vx} ${vy} ${vw} ${vh}">
  <!-- ${char} 초성:${colors.choseong} 중성:${colors.jungseong} 종성:${colors.jongseong} -->
${paths}
</svg>`;
}

mkdirSync(scratchDir, { recursive: true });

for (const { char, colors } of testWords) {
  const svg = buildSVG(char, colors);
  const filename = join(scratchDir, `test_output_${char}.svg`);
  writeFileSync(filename, svg, 'utf8');
  console.log(`  → 저장: ${filename}`);
}

console.log('\n✅ SVG 파일 생성 완료! scratch/test_output_*.svg 파일을 브라우저로 열어 확인하세요.');
