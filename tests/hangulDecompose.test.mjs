import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CHOSEONG_LIST,
  JONGSEONG_LIST,
  JUNGSEONG_LIST,
  classifyComponents,
  decomposeHangul,
  isHangulSyllable,
  parseText,
} from '../src/utils/hangulDecompose.js';
import { DIPHTHONG_INITIAL_SPLIT_X, getAutoGridTransform, sortJamoPaths } from '../src/utils/fontParser.js';

test('recognizes only precomposed Hangul syllables', () => {
  assert.equal(isHangulSyllable('가'), true);
  assert.equal(isHangulSyllable('힣'), true);
  assert.equal(isHangulSyllable('ㄱ'), false);
  assert.equal(isHangulSyllable('A'), false);
});

test('decomposes every precomposed Hangul syllable into valid jamo indexes', () => {
  for (let offset = 0; offset < 19 * 21 * 28; offset += 1) {
    const char = String.fromCharCode(0xac00 + offset);
    const decomposed = decomposeHangul(char);

    assert.equal(decomposed.choseong.index, Math.floor(offset / 588));
    assert.equal(decomposed.jungseong.index, Math.floor(offset / 28) % 21);
    assert.equal(decomposed.jongseong.index, offset % 28);
    assert.equal(decomposed.hasJongseong, offset % 28 > 0);
    assert.ok(CHOSEONG_LIST.includes(decomposed.choseong.jamo));
    assert.ok(JUNGSEONG_LIST.includes(decomposed.jungseong.jamo));
    assert.ok(JONGSEONG_LIST.includes(decomposed.jongseong.jamo));
  }
});

test('parses mixed text without splitting surrogate pairs', () => {
  const parsed = parseText('가A😀각');
  assert.deepEqual(parsed.map(({ char, isHangul }) => ({ char, isHangul })), [
    { char: '가', isHangul: true },
    { char: 'A', isHangul: false },
    { char: '😀', isHangul: false },
    { char: '각', isHangul: true },
  ]);
});

test('classifies composite glyph components in the UnDotum component order', () => {
  const components = [{ glyphIndex: 1 }, { glyphIndex: 2 }, { glyphIndex: 3 }];
  assert.deepEqual(
    classifyComponents(components, { hasJongseong: true }).map(({ type }) => type),
    ['choseong', 'jongseong', 'jungseong'],
  );
  assert.deepEqual(
    classifyComponents(components.slice(0, 2), { hasJongseong: false }).map(({ type }) => type),
    ['choseong', 'jungseong'],
  );
});

test('orders layers deterministically and calculates all grid layouts', () => {
  assert.equal(DIPHTHONG_INITIAL_SPLIT_X, 110);
  const paths = [{ type: 'jongseong' }, { type: 'choseong' }, { type: 'jungseong' }];
  assert.deepEqual(sortJamoPaths(paths, ['jungseong', 'jongseong', 'choseong']).map(({ type }) => type), [
    'jungseong',
    'jongseong',
    'choseong',
  ]);

  const bounds = { x1: 20, y1: 20, x2: 80, y2: 80 };
  const layouts = [
    { isVerticalVowel: true, isHorizontalVowel: false, isDiphthong: false, hasJongseong: false },
    { isVerticalVowel: true, isHorizontalVowel: false, isDiphthong: false, hasJongseong: true },
    { isVerticalVowel: false, isHorizontalVowel: true, isDiphthong: false, hasJongseong: false },
    { isVerticalVowel: false, isHorizontalVowel: true, isDiphthong: false, hasJongseong: true },
    { isVerticalVowel: false, isHorizontalVowel: false, isDiphthong: true, hasJongseong: false },
    { isVerticalVowel: false, isHorizontalVowel: false, isDiphthong: true, hasJongseong: true },
  ];

  for (const layout of layouts) {
    for (const type of ['choseong', 'jungseong', ...(layout.hasJongseong ? ['jongseong'] : [])]) {
      assert.match(getAutoGridTransform(layout, type, bounds), /^translate\(.+\) scale\(0\.85\)$/);
    }
  }
});
