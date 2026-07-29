/**
 * SyllableRenderer.jsx
 * 한 음절의 초성/중성/종성을 색상별로 분리하여 SVG로 렌더링
 * opentype.js composite glyph 분해 결과를 사용
 */

import React, { useEffect, useState, useRef } from 'react';
import { extractJamoPaths, getFont, getGlyphBoundingBox, buildExportSVG } from '../utils/fontParser';
import { decomposeHangul } from '../utils/hangulDecompose';
import { PREVIEW_SIZE_MAX } from '../utils/colorTemplates';

const RENDER_SIZE = 200; // 내부 렌더링 em 단위

/**
 * 단일 음절 SVG 렌더러
 * 셀 자리는 항상 L(PREVIEW_SIZE_MAX)로 고정 — S/M 전환 시 레이아웃 출렁임 없음
 */
export default function SyllableRenderer({ char, colors, displaySize = 160, fontRevision = 0 }) {
  const [paths, setPaths] = useState(null);
  const [bbox, setBbox] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState('');
  const prevCharRef = useRef(char);

  const decomposed = decomposeHangul(char);

  const colorMap = {
    choseong: colors?.choseong || '#E53E3E',
    jungseong: colors?.jungseong || '#3182CE',
    jongseong: colors?.jongseong || '#718096',
  };

  useEffect(() => {
    if (!char) return;

    const charChanged = prevCharRef.current !== char;
    prevCharRef.current = char;

    if (charChanged) {
      setLoading(true);
      setError(null);
      setPaths(null);
      setBbox(null);
    }

    try {
      const font = getFont();
      if (!font) {
        setError('폰트 로딩 중...');
        setLoading(false);
        return;
      }

      const jamoPaths = extractJamoPaths(char, RENDER_SIZE);

      if (!jamoPaths || jamoPaths.length === 0) {
        setError('글리프 추출 실패');
        setLoading(false);
        return;
      }

      const bb = getGlyphBoundingBox(char, RENDER_SIZE);
      setPaths(jamoPaths);
      setBbox(bb);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('[SyllableRenderer] 오류:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [char, fontRevision]);

  if (!char) return null;

  let viewBox = `0 0 ${RENDER_SIZE} ${RENDER_SIZE}`;
  if (bbox && bbox.x1 !== undefined && bbox.x1 !== Infinity) {
    const pad = RENDER_SIZE * 0.04;
    const vx = Math.floor(bbox.x1 - pad);
    const vy = Math.floor(bbox.y1 - pad);
    const vw = Math.ceil(bbox.x2 - bbox.x1 + pad * 2);
    const vh = Math.ceil(bbox.y2 - bbox.y1 + pad * 2);
    if (vw > 0 && vh > 0) {
      viewBox = `${vx} ${vy} ${vw} ${vh}`;
    }
  }

  const handleCopy = async () => {
    try {
      const pngBlob = await exportPNG(char, colors, 300);
      if (!pngBlob) throw new Error('변환 실패');
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob }),
      ]);
      setCopyStatus('복사됨!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setCopyStatus('오류');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const svgSize = displaySize * 0.82;

  return (
    <div className="syllable-cell" style={{ width: PREVIEW_SIZE_MAX }}>
      <div
        className="syllable-glyph-slot"
        style={{ width: PREVIEW_SIZE_MAX, height: PREVIEW_SIZE_MAX }}
      >
        <div
          className="preview-bg-checker syllable-glyph-frame group relative flex items-center justify-center"
          style={{ width: displaySize, height: displaySize }}
        >
          {loading && (
            <div className="shimmer w-full h-full absolute inset-0" style={{ borderRadius: 12 }} />
          )}
          {error && !loading && (
            <div className="text-xs text-center px-2" style={{ color: 'var(--text-muted)' }}>
              {error}
            </div>
          )}
          {!loading && !error && paths && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox={viewBox}
              style={{
                width: svgSize,
                height: svgSize,
                overflow: 'visible',
                transition: 'width 0.28s cubic-bezier(0.34, 1.05, 0.64, 1), height 0.28s cubic-bezier(0.34, 1.05, 0.64, 1)',
              }}
            >
              {paths.map((jp, i) => (
                <path
                  key={`${jp.type}-${i}-${jp.glyphIndex ?? i}`}
                  fill={colorMap[jp.type] || '#ffffff'}
                  d={jp.pathData}
                />
              ))}
            </svg>
          )}

          {!loading && !error && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-[2px]">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-transform active:scale-95 flex items-center gap-2"
              >
                {copyStatus || 'PNG 복사하기'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex items-center gap-1 flex-wrap justify-center"
        style={{ minHeight: 24, opacity: !loading && !error && decomposed ? 1 : 0 }}
      >
        {decomposed && (
          <>
            <span
              className="jamo-tag"
              style={{
                color: colorMap.choseong,
                borderColor: colorMap.choseong + '55',
                background: colorMap.choseong + '18',
                fontSize: 11,
                padding: '2px 7px',
              }}
            >
              {decomposed.choseong.jamo}
            </span>
            <span
              className="jamo-tag"
              style={{
                color: colorMap.jungseong,
                borderColor: colorMap.jungseong + '55',
                background: colorMap.jungseong + '18',
                fontSize: 11,
                padding: '2px 7px',
              }}
            >
              {decomposed.jungseong.jamo}
            </span>
            {decomposed.hasJongseong && (
              <span
                className="jamo-tag"
                style={{
                  color: colorMap.jongseong,
                  borderColor: colorMap.jongseong + '55',
                  background: colorMap.jongseong + '18',
                  fontSize: 11,
                  padding: '2px 7px',
                }}
              >
                {decomposed.jongseong.jamo}
              </span>
            )}
          </>
        )}
      </div>

      <div
        className="text-xs font-semibold"
        style={{ color: 'var(--text-muted)', fontFamily: 'Noto Sans KR', minHeight: 16 }}
      >
        {char}
      </div>
    </div>
  );
}

/**
 * SVG 문자열 내보내기 (투명 배경)
 */
export function exportSVG(char, colors, outputSize = 300) {
  return buildExportSVG(char, colors, outputSize, 200);
}

/**
 * SVG → PNG Canvas 변환 (투명 배경)
 */
export async function exportPNG(char, colors, outputSize = 300) {
  const svgString = exportSVG(char, colors, outputSize);
  if (!svgString) return null;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, outputSize, outputSize);

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0, outputSize, outputSize);
      URL.revokeObjectURL(url);
      canvas.toBlob(pngBlob => {
        resolve(pngBlob);
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG → PNG 변환 실패'));
    };

    img.src = url;
  });
}
