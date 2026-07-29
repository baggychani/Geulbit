/**
 * fontParser.js
 * opentype.js를 사용하여 UnDotum 폰트의 복합 글리프를 분해하고
 * 초성/중성/종성별 SVG path를 추출합니다.
 * 
 * === UnDotum 폰트 검증 결과 ===
 * - 모든 한글 음절이 composite glyph (numberOfContours === -1)
 * - components[] 배열에 dx=0, dy=0 (오프셋 없음)
 * - 각 자소 글리프가 이미 음절 좌표계에 절대 배치되어 있음
 * - 받침 있음: 컴포넌트 3개, 받침 없음: 컴포넌트 2개
 * - 겹받침도 3개 컴포넌트로 통합 (겹받침 = 하나의 자소 글리프)
 * → transform 변환 불필요! 각 컴포넌트 path를 그대로 합치면 됨
 */

import opentype from 'opentype.js';
import { decomposeHangul, classifyComponents } from './hangulDecompose';

let loadedFont = null;

/**
 * UnDotum 폰트 로드 (싱글톤)
 */
export async function loadFont(fontUrl = '/UnDotum.ttf') {
  if (loadedFont) return loadedFont;

  const response = await fetch(fontUrl);
  if (!response.ok) throw new Error(`폰트 파일 로드 실패 (${response.status}): ${fontUrl}`);
  const buffer = await response.arrayBuffer();
  const font = opentype.parse(buffer);
  loadedFont = font;

  console.log('[FontParser] UnDotum 로드 완료:', {
    numGlyphs: font.numGlyphs,
    unitsPerEm: font.unitsPerEm,
  });
  return font;
}

/**
 * 외부 업로드 폰트 파일(ArrayBuffer) 로드
 */
export async function loadFontFromBuffer(arrayBuffer) {
  const font = opentype.parse(arrayBuffer);
  loadedFont = font;
  return font;
}

/**
 * 현재 로드된 폰트 반환
 */
export function getFont() {
  return loadedFont;
}

/**
 * 한글 음절의 복합 글리프를 분해하여
 * 초성/중성/종성별 SVG path data를 반환합니다.
 * 
 * UnDotum 특성상 각 자소 컴포넌트의 dx=dy=0 이므로
 * getPath(0, fontSize, fontSize)를 그대로 사용.
 * 
 * @param {string} char - 한글 음절 (예: '한')
 * @param {number} fontSize - 렌더링 크기 (font unit → pixel scale)
 * @returns {Array<{type, pathData}>|null}
 */
export function extractJamoPaths(char, fontSize = 200) {
  const font = loadedFont;
  if (!font) throw new Error('Font not loaded');

  const decomposed = decomposeHangul(char);
  if (!decomposed) return null;

  const glyph = font.charToGlyph(char);
  if (!glyph) return null;

  // ✅ 복합 글리프: 컴포넌트별 분리
  if (glyph.numberOfContours === -1 && glyph.components?.length > 0) {
    const classified = classifyComponents(glyph.components, decomposed);
    const result = [];

    for (const comp of classified) {
      const childGlyph = font.glyphs.get(comp.glyphIndex);
      if (!childGlyph) continue;

      // 하위 글리프가 또 복합인 경우 → getPath로 자동 flatten
      // (UnDotum에서는 발생하지 않지만 안전장치)
      const path = childGlyph.getPath(0, fontSize, fontSize);
      const pathData = path.toPathData(3);

      if (pathData && pathData.length > 0) {
        result.push({
          type: comp.type,
          pathData,
          glyphIndex: comp.glyphIndex,
          glyphName: childGlyph.name || '',
        });
      }
    }

    if (result.length > 0) return result;
  }

  // 폴백: 단순 글리프 전체를 초성으로
  console.warn(`[FontParser] '${char}': 단순 글리프 또는 컴포넌트 없음 → 폴백`);
  const path = glyph.getPath(0, fontSize, fontSize);
  return [{
    type: 'choseong',
    pathData: path.toPathData(3),
    glyphIndex: glyph.index,
    glyphName: glyph.name || '',
  }];
}

/**
 * 글리프의 bounding box 계산
 */
export function getGlyphBoundingBox(char, fontSize = 200) {
  const font = loadedFont;
  if (!font) return null;
  const glyph = font.charToGlyph(char);
  if (!glyph) return null;
  try {
    return glyph.getPath(0, fontSize, fontSize).getBoundingBox();
  } catch {
    return null;
  }
}

/**
 * SVG 문자열 생성 (투명 배경, 내보내기용)
 * viewBox는 실제 글리프 bounding box 기준으로 계산
 */
export function buildExportSVG(char, colors, outputSize = 300, fontSize = 200) {
  const font = loadedFont;
  if (!font) return null;

  const jamoPaths = extractJamoPaths(char, fontSize);
  if (!jamoPaths?.length) return null;

  const bb = getGlyphBoundingBox(char, fontSize);
  const colorMap = {
    choseong:  colors?.choseong  || '#E53E3E',
    jungseong: colors?.jungseong || '#3182CE',
    jongseong: colors?.jongseong || '#38A169',
  };

  let viewBox = `0 0 ${fontSize} ${fontSize}`;
  if (bb && isFinite(bb.x1)) {
    const pad = fontSize * 0.04;
    const vx = (bb.x1 - pad).toFixed(1);
    const vy = (bb.y1 - pad).toFixed(1);
    const vw = (bb.x2 - bb.x1 + pad * 2).toFixed(1);
    const vh = (bb.y2 - bb.y1 + pad * 2).toFixed(1);
    if (parseFloat(vw) > 0 && parseFloat(vh) > 0) {
      viewBox = `${vx} ${vy} ${vw} ${vh}`;
    }
  }

  const decomposed = decomposeHangul(char);
  const jamoInfo = decomposed
    ? `초성(${decomposed.choseong.jamo}) 중성(${decomposed.jungseong.jamo}) ${decomposed.hasJongseong ? `종성(${decomposed.jongseong.jamo})` : '(받침 없음)'}`
    : '';

  const pathEls = jamoPaths.map(jp =>
    `  <path fill="${colorMap[jp.type] || '#000'}" d="${jp.pathData}"/>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${outputSize}" height="${outputSize}" viewBox="${viewBox}">
  <!-- ${char} | ${jamoInfo} -->
  <!-- 초성:${colorMap.choseong} 중성:${colorMap.jungseong} 종성:${colorMap.jongseong} -->
${pathEls}
</svg>`;
}
