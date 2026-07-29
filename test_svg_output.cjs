// test_svg_output.cjs
// UnDotum composite glyph 분해 → SVG 생성 검증 (CommonJS)

const opentype = require('./node_modules/opentype.js');
const fs = require('fs');

const buf = fs.readFileSync('./UnDotum.ttf');
const font = opentype.parse(buf.buffer);

const FONT_SIZE = 200;

const testCases = [
  { char: '\uD55C', label: '한', colors: { choseong: '#E53E3E', jungseong: '#3182CE', jongseong: '#38A169' } },
  { char: '\uAC00', label: '가', colors: { choseong: '#FF6B6B', jungseong: '#4ECDC4', jongseong: '#FFE66D' } },
  { char: '\uAE00', label: '글', colors: { choseong: '#9B59B6', jungseong: '#2ECC71', jongseong: '#F39C12' } },
  { char: '\uB2ED', label: '닭', colors: { choseong: '#E74C3C', jungseong: '#3498DB', jongseong: '#1ABC9C' } },
  { char: '\uBDC1', label: '뷁', colors: { choseong: '#FF0090', jungseong: '#00FF88', jongseong: '#00CFFF' } },
];

function getType(i, n) {
  if (n === 2) return i === 0 ? 'choseong' : 'jungseong';
  if (i === 0) return 'choseong';
  if (i === n - 1) return 'jongseong';
  return 'jungseong';
}

function buildSVG(char, label, colors, outputSize) {
  const glyph = font.charToGlyph(char);
  const isComp = glyph.numberOfContours === -1 && glyph.components && glyph.components.length > 0;
  console.log('\n=== ' + label + ' ===');
  console.log('  isComposite:', isComp, 'components:', glyph.components ? glyph.components.length : 0);

  const colorMap = { choseong: colors.choseong, jungseong: colors.jungseong, jongseong: colors.jongseong };
  const fullPath = glyph.getPath(0, FONT_SIZE, FONT_SIZE);
  const bb = fullPath.getBoundingBox();
  const pad = FONT_SIZE * 0.04;
  const vx = (bb.x1 - pad).toFixed(1);
  const vy = (bb.y1 - pad).toFixed(1);
  const vw = (bb.x2 - bb.x1 + pad * 2).toFixed(1);
  const vh = (bb.y2 - bb.y1 + pad * 2).toFixed(1);

  let pathEls = '';
  if (isComp) {
    const n = glyph.components.length;
    pathEls = glyph.components.map(function(comp, i) {
      const type = getType(i, n);
      const cg = font.glyphs.get(comp.glyphIndex);
      const p = cg.getPath(0, FONT_SIZE, FONT_SIZE);
      const pd = p.toPathData(3);
      console.log('  comp[' + i + '] type=' + type + ' name=' + cg.name + ' pathLen=' + pd.length);
      return '  <path fill="' + colorMap[type] + '" d="' + pd + '"/>';
    }).join('\n');
  } else {
    const pd = fullPath.toPathData(3);
    pathEls = '  <path fill="' + colorMap.choseong + '" d="' + pd + '"/>';
  }

  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + outputSize + '" height="' + outputSize + '" viewBox="' + vx + ' ' + vy + ' ' + vw + ' ' + vh + '">\n' +
    pathEls + '\n' +
    '</svg>';
}

testCases.forEach(function(tc) {
  const svg = buildSVG(tc.char, tc.label, tc.colors, 300);
  const fname = 'test_output_' + tc.label + '.svg';
  fs.writeFileSync(fname, svg, 'utf8');
  console.log('  -> saved: ' + fname);
});

console.log('\nDone! Open test_output_*.svg in browser to verify.');
