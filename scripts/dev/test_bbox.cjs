// 프로젝트 루트에서: node scripts/dev/test_bbox.cjs
// 복합 글리프 bounding box 및 컴포넌트 위치 검증

const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..', '..');
const opentype = require(path.join(root, 'node_modules', 'opentype.js'));

const buf = fs.readFileSync(path.join(root, 'public', 'UnDotum.ttf'));
const font = opentype.parse(buf.buffer);
const FONT_SIZE = 200;

const testChars = ['\uBCF4', '\uD55C', '\uAC00']; // 보, 한, 가

testChars.forEach(function (char) {
  const glyph = font.charToGlyph(char);
  console.log('\n=== ' + char + ' ===');

  const fullPath = glyph.getPath(0, FONT_SIZE, FONT_SIZE);
  const fullBB = fullPath.getBoundingBox();
  console.log('composite getPath BB:', JSON.stringify(fullBB));

  if (glyph.components) {
    glyph.components.forEach(function (comp, i) {
      const cg = font.glyphs.get(comp.glyphIndex);
      const cPath = cg.getPath(0, FONT_SIZE, FONT_SIZE);
      const cBB = cPath.getBoundingBox();
      console.log(
        '  comp[' +
          i +
          '] ' +
          cg.name +
          ' BB: x1=' +
          cBB.x1.toFixed(1) +
          ' y1=' +
          cBB.y1.toFixed(1) +
          ' x2=' +
          cBB.x2.toFixed(1) +
          ' y2=' +
          cBB.y2.toFixed(1),
      );
    });
  }

  let ux1 = Infinity,
    uy1 = Infinity,
    ux2 = -Infinity,
    uy2 = -Infinity;
  (glyph.components || []).forEach(function (comp) {
    const cg = font.glyphs.get(comp.glyphIndex);
    const bb = cg.getPath(0, FONT_SIZE, FONT_SIZE).getBoundingBox();
    if (isFinite(bb.x1)) {
      ux1 = Math.min(ux1, bb.x1);
      uy1 = Math.min(uy1, bb.y1);
      ux2 = Math.max(ux2, bb.x2);
      uy2 = Math.max(uy2, bb.y2);
    }
  });
  console.log('  union BB: x1=' + ux1.toFixed(1) + ' y1=' + uy1.toFixed(1) + ' x2=' + ux2.toFixed(1) + ' y2=' + uy2.toFixed(1));
  console.log('  comp[0] y2 vs comp[1] y1 gap:', '(check above)');
});
