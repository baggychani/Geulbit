/**
 * fontParser.js
 * opentype.js를 사용하여 UnDotum 폰트의 복합 글리프를 분해하고
 * 초성/중성/종성별 SVG path를 추출합니다.
 *
 * === UnDotum 폰트 검증 결과 ===
 * - 모든 한글 음절이 composite glyph
 * - components[]: dx=0, dy=0 (오프셋 없음)
 * - 받침 없음(2): [초성, 중성]
 * - 받침 있음(3): [초성, 종성, 중성]  ← 중·종 순서가 일반적인 가정과 다름
 * - 겹받침도 종성 1컴포넌트로 통합
 */

import opentype from 'opentype.js';
import { decomposeHangul, classifyComponents } from './hangulDecompose';

let loadedFont = null;
let loadedFontUrl = null;
/** URL → 파싱된 폰트 (전환 시 재 fetch/parse 방지) */
const fontCache = new Map();

/** 번들 폰트 (public/) */
export const FONT_VARIANTS = {
  regular: {
    url: '/UnDotum.ttf',
    label: '일반',
    displayName: 'UnDotum',
  },
  bold: {
    url: '/UnDotumBold.ttf',
    label: '굵게',
    displayName: 'UnDotum Bold',
  },
};

/**
 * 폰트 로드 후 캐시에 보관. 이미 있으면 캐시 반환.
 */
export async function loadFont(fontUrl = FONT_VARIANTS.regular.url, { force = false } = {}) {
  if (!force && fontCache.has(fontUrl)) {
    loadedFont = fontCache.get(fontUrl);
    loadedFontUrl = fontUrl;
    return loadedFont;
  }

  const response = await fetch(fontUrl);
  if (!response.ok) throw new Error(`폰트 파일 로드 실패 (${response.status}): ${fontUrl}`);
  const buffer = await response.arrayBuffer();
  const font = opentype.parse(buffer);
  fontCache.set(fontUrl, font);
  loadedFont = font;
  loadedFontUrl = fontUrl;

  console.log('[FontParser] 폰트 로드 완료:', fontUrl, {
    numGlyphs: font.numGlyphs,
    unitsPerEm: font.unitsPerEm,
  });
  return font;
}

/**
 * 캐시된 폰트를 활성 폰트로 즉시 전환 (네트워크/파싱 없음)
 */
export function setActiveFont(fontUrl) {
  const font = fontCache.get(fontUrl);
  if (!font) {
    throw new Error(`폰트가 아직 캐시되지 않음: ${fontUrl}`);
  }
  loadedFont = font;
  loadedFontUrl = fontUrl;
  return font;
}

/**
 * 번들 폰트 전부 미리 로드
 */
export async function preloadBundledFonts() {
  const urls = Object.values(FONT_VARIANTS).map(v => v.url);
  await Promise.all(urls.map(url => loadFont(url)));
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

  // opentype.js는 path 접근 전에 composite 메타가 비어 있을 수 있음
  void glyph.path;

  // 복합 글리프: 컴포넌트별 분리
  if (glyph.components?.length > 0) {
    const classified = classifyComponents(glyph.components, decomposed);
    const result = [];

    for (const comp of classified) {
      const childGlyph = font.glyphs.get(comp.glyphIndex);
      if (!childGlyph) continue;

      // (UnDotum에서는 발생하지 않지만 안전장치)
      const path = childGlyph.getPath(0, fontSize, fontSize);
      const pathData = path.toPathData(3);
      const bounds = path.getBoundingBox();

      if (pathData && pathData.length > 0) {
        result.push({
          type: comp.type,
          pathData,
          glyphIndex: comp.glyphIndex,
          glyphName: childGlyph.name || '',
          bounds,
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
    bounds: path.getBoundingBox(),
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
    void glyph.path;
    return glyph.getPath(0, fontSize, fontSize).getBoundingBox();
  } catch {
    return null;
  }
}

export const LAYER_ORDERS = {
  choseong_top: {
    id: 'choseong_top',
    label: '초성 맨 위 (권장)',
    order: ['jungseong', 'jongseong', 'choseong'],
  },
  jungseong_top: {
    id: 'jungseong_top',
    label: '중성 맨 위',
    order: ['choseong', 'jongseong', 'jungseong'],
  },
  jongseong_top: {
    id: 'jongseong_top',
    label: '종성 맨 위',
    order: ['choseong', 'jungseong', 'jongseong'],
  },
};

export const DEFAULT_LAYER_ORDER = LAYER_ORDERS.choseong_top.order;

/**
 * 자소 패스를 Z-Order(레이어 순서)에 맞춰 정렬합니다.
 * 배열 앞쪽이 아래 레이어(먼저 그려짐), 뒤쪽이 위 레이어(나중에 그려짐)
 */
export function sortJamoPaths(jamoPaths, layerOrder = DEFAULT_LAYER_ORDER) {
  if (!jamoPaths || jamoPaths.length < 2) return jamoPaths;
  const orderMap = {};
  layerOrder.forEach((type, idx) => {
    orderMap[type] = idx;
  });
  return [...jamoPaths].sort((a, b) => (orderMap[a.type] ?? 0) - (orderMap[b.type] ?? 0));
}

/**
 * SVG 문자열 생성 (투명 배경, 내보내기용)
 * viewBox는 실제 글리프 bounding box 기준으로 계산
 */
export function buildExportSVG(char, colors, outputSize = 300, fontSize = 200, layerOrder = DEFAULT_LAYER_ORDER, renderMode = 'classic') {
  const font = loadedFont;
  if (!font) return null;

  const rawJamoPaths = extractJamoPaths(char, fontSize);
  if (!rawJamoPaths?.length) return null;

  const jamoPaths = sortJamoPaths(rawJamoPaths, layerOrder);

  const bb = getGlyphBoundingBox(char, fontSize);
  const colorMap = {
    choseong:  colors?.choseong  || '#E53E3E',
    jungseong: colors?.jungseong || '#3182CE',
    jongseong: colors?.jongseong || '#718096',
  };

  const decomposed = decomposeHangul(char);
  const isGridActive = renderMode === 'grid' && decomposed && !decomposed.isDiphthong;

  let viewBox = `0 0 ${fontSize} ${fontSize}`;
  if (!isGridActive && bb && isFinite(bb.x1)) {
    const pad = fontSize * 0.04;
    const vx = (bb.x1 - pad).toFixed(1);
    const vy = (bb.y1 - pad).toFixed(1);
    const vw = (bb.x2 - bb.x1 + pad * 2).toFixed(1);
    const vh = (bb.y2 - bb.y1 + pad * 2).toFixed(1);
    if (parseFloat(vw) > 0 && parseFloat(vh) > 0) {
      viewBox = `${vx} ${vy} ${vw} ${vh}`;
    }
  }

  const jamoInfo = decomposed
    ? `초성(${decomposed.choseong.jamo}) 중성(${decomposed.jungseong.jamo}) ${decomposed.hasJongseong ? `종성(${decomposed.jongseong.jamo})` : '(받침 없음)'}`
    : '';

  let gridSvgLines = '';
  if (isGridActive) {
    gridSvgLines = `  <g stroke="#cbd5e1" stroke-width="2" fill="none">\n    <rect x="10" y="10" width="180" height="180" rx="8" />\n`;
    if (decomposed.isVerticalVowel && !decomposed.hasJongseong) {
      gridSvgLines += `    <line x1="100" y1="10" x2="100" y2="190"/>\n`;
    } else if (decomposed.isVerticalVowel && decomposed.hasJongseong) {
      gridSvgLines += `    <line x1="100" y1="10" x2="100" y2="100"/>\n    <line x1="10" y1="100" x2="190" y2="100"/>\n`;
    } else if (decomposed.isHorizontalVowel && !decomposed.hasJongseong) {
      gridSvgLines += `    <line x1="10" y1="100" x2="190" y2="100"/>\n`;
    } else if (decomposed.isHorizontalVowel && decomposed.hasJongseong) {
      gridSvgLines += `    <line x1="10" y1="70" x2="190" y2="70"/>\n    <line x1="10" y1="130" x2="190" y2="130"/>\n`;
    }
    gridSvgLines += `  </g>\n`;
  }

  const pathEls = jamoPaths.map(jp => {
    let tf = '';
    if (isGridActive) {
      tf = getAutoGridTransform(decomposed, jp.type, jp.bounds);
      if (tf) tf = `transform="${tf}"`;
    }
    return `  <path fill="${colorMap[jp.type] || '#000'}" d="${jp.pathData}" ${tf}/>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${outputSize}" height="${outputSize}" viewBox="${viewBox}">
  <!-- ${char} | ${jamoInfo} -->
  <!-- 초성:${colorMap.choseong} 중성:${colorMap.jungseong} 종성:${colorMap.jongseong} -->
${gridSvgLines}${pathEls}
</svg>`;
}

export function getAutoGridTransform(decomposed, jpType, bounds, outerPad = 10, renderSize = 200) {
  if (!decomposed || decomposed.isDiphthong || !bounds) return '';

  let cell = null;

  if (decomposed.isVerticalVowel && !decomposed.hasJongseong) {
    if (jpType === 'choseong') cell = { x1: outerPad, y1: outerPad, x2: 100, y2: renderSize - outerPad };
    if (jpType === 'jungseong') cell = { x1: 100, y1: outerPad, x2: renderSize - outerPad, y2: renderSize - outerPad };
  } else if (decomposed.isVerticalVowel && decomposed.hasJongseong) {
    if (jpType === 'choseong') cell = { x1: outerPad, y1: outerPad, x2: 100, y2: 100 };
    if (jpType === 'jungseong') cell = { x1: 100, y1: outerPad, x2: renderSize - outerPad, y2: 100 };
    if (jpType === 'jongseong') cell = { x1: outerPad, y1: 100, x2: renderSize - outerPad, y2: renderSize - outerPad };
  } else if (decomposed.isHorizontalVowel && !decomposed.hasJongseong) {
    if (jpType === 'choseong') cell = { x1: outerPad, y1: outerPad, x2: renderSize - outerPad, y2: 100 };
    if (jpType === 'jungseong') cell = { x1: outerPad, y1: 100, x2: renderSize - outerPad, y2: renderSize - outerPad };
  } else if (decomposed.isHorizontalVowel && decomposed.hasJongseong) {
    if (jpType === 'choseong') cell = { x1: outerPad, y1: outerPad, x2: renderSize - outerPad, y2: 70 };
    if (jpType === 'jungseong') cell = { x1: outerPad, y1: 70, x2: renderSize - outerPad, y2: 130 };
    if (jpType === 'jongseong') cell = { x1: outerPad, y1: 130, x2: renderSize - outerPad, y2: renderSize - outerPad };
  }

  if (!cell) return '';

  const cellCx = (cell.x1 + cell.x2) / 2;
  const cellCy = (cell.y1 + cell.y2) / 2;

  const jamoCx = (bounds.x1 + bounds.x2) / 2;
  const jamoCy = (bounds.y1 + bounds.y2) / 2;

  // 1. Fixed global scale maintains structural hierarchy and stroke proportions.
  const GLOBAL_SCALE = 0.85;

  // 2. Exact mathematical translation centering within the dedicated structural grid cell.
  const tx = cellCx - jamoCx * GLOBAL_SCALE;
  const ty = cellCy - jamoCy * GLOBAL_SCALE;

  return `translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${GLOBAL_SCALE})`;
}

