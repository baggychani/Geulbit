/**
 * SyllableRenderer.jsx
 * 한 음절의 초성/중성/종성을 색상별로 분리하여 SVG로 렌더링
 * opentype.js composite glyph 분해 결과를 사용
 */

import { useEffect, useState, useRef } from 'react';
import { DIPHTHONG_INITIAL_SPLIT_X, extractJamoPaths, getFont, getGlyphBoundingBox, sortJamoPaths, DEFAULT_LAYER_ORDER, getAutoGridTransform } from '../utils/fontParser';
import { decomposeHangul } from '../utils/hangulDecompose';
import { useT } from '../utils/i18n';
import { exportPNG } from '../utils/imageExport';

const RENDER_SIZE = 200; // 내부 렌더링 em 단위

/**
 * 단일 음절 SVG 렌더러
 * 셀 자리는 항상 L(PREVIEW_SIZE_MAX)로 고정 — S/M 전환 시 레이아웃 출렁임 없음
 */
export default function SyllableRenderer({
  char,
  colors,
  displaySize = 160,
  fontRevision = 0,
  layerOrder = DEFAULT_LAYER_ORDER,
  renderMode = 'classic',
  previewBackground = 'checker',
}) {
  const [paths, setPaths] = useState(null);
  const [bbox, setBbox] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState('');
  const prevCharRef = useRef(char);
  const t = useT();

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
        setError(t('font.loadingMsg'));
        setLoading(false);
        return;
      }

      const jamoPaths = extractJamoPaths(char, RENDER_SIZE);

      if (!jamoPaths || jamoPaths.length === 0) {
        setError(t('syllable.extractFail'));
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
  }, [char, fontRevision, t]);

  if (!char) return null;

  const isGridActive = renderMode === 'grid' && decomposed;

  const viewBox = `0 0 ${RENDER_SIZE} ${RENDER_SIZE}`;
  let classicTransform = '';

  if (bbox && bbox.x1 !== undefined && bbox.x1 !== Infinity) {
    const pad = RENDER_SIZE * 0.04;
    const bw = bbox.x2 - bbox.x1;
    const bh = bbox.y2 - bbox.y1;
    
    if (bw > 0 && bh > 0) {
      const cx = (bbox.x1 + bbox.x2) / 2;
      const cy = (bbox.y1 + bbox.y2) / 2;
      
      const targetW = RENDER_SIZE - pad * 2;
      const targetH = RENDER_SIZE - pad * 2;
      // 너무 작을 때는 강제로 키우지 않고(max scale 1), 클 때만 줄임
      const scale = Math.min(targetW / bw, targetH / bh, 1);
      
      const tx = (RENDER_SIZE / 2) - cx * scale;
      const ty = (RENDER_SIZE / 2) - cy * scale;
      
      classicTransform = `translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${scale.toFixed(3)})`;
    }
  }

  const handleCopy = async () => {
    try {
      const pngBlob = await exportPNG(char, colors, 300, layerOrder, renderMode);
      if (!pngBlob) throw new Error('변환 실패');
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob }),
      ]);
      setCopyStatus(t('syllable.copied'));
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setCopyStatus(t('syllable.copyError'));
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const svgSize = displaySize * 0.82;
  const renderPaths = sortJamoPaths(paths, layerOrder);

  const transitionStyle = 'width 0.28s cubic-bezier(0.34, 1.05, 0.64, 1), height 0.28s cubic-bezier(0.34, 1.05, 0.64, 1)';

  return (
    <div className="syllable-cell" style={{ width: displaySize, transition: transitionStyle }}>
      <div
        className="syllable-glyph-slot"
        style={{ width: displaySize, height: displaySize, transition: transitionStyle }}
      >
        <div
          className={`${previewBackground === 'solid' ? 'preview-bg-solid' : 'preview-bg-checker'} syllable-glyph-frame group relative flex items-center justify-center`}
          style={{ width: displaySize, height: displaySize, transition: transitionStyle }}
        >
          {loading && (
            <div className="shimmer w-full h-full absolute inset-0" style={{ borderRadius: 12 }} />
          )}
          {error && !loading && (
            <div className="text-xs text-center px-2" style={{ color: 'var(--text-muted)' }}>
              {error}
            </div>
          )}
          {!loading && !error && renderPaths && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox={viewBox}
              style={{
                width: svgSize,
                height: svgSize,
                overflow: 'visible',
                transition: transitionStyle,
              }}
            >
              {/* 그리드 외곽 및 분할선 렌더링 */}
              {isGridActive && (
                <g stroke="#cbd5e1" strokeWidth="2" fill="none">
                  <rect x="10" y="10" width="180" height="180" rx="8" />
                  
                  {decomposed.isVerticalVowel && !decomposed.hasJongseong && (
                    <line x1="100" y1="10" x2="100" y2="190" />
                  )}
                  {decomposed.isVerticalVowel && decomposed.hasJongseong && (
                    <>
                      <line x1="100" y1="10" x2="100" y2="100" />
                      <line x1="10" y1="100" x2="190" y2="100" />
                    </>
                  )}
                  {decomposed.isHorizontalVowel && !decomposed.hasJongseong && (
                    <line x1="10" y1="100" x2="190" y2="100" />
                  )}
                  {decomposed.isHorizontalVowel && decomposed.hasJongseong && (
                    <>
                      <line x1="10" y1="70" x2="190" y2="70" />
                      <line x1="10" y1="130" x2="190" y2="130" />
                    </>
                  )}
                  {decomposed.isDiphthong && !decomposed.hasJongseong && (
                    <>
                      <line x1="10" y1="100" x2={DIPHTHONG_INITIAL_SPLIT_X} y2="100" />
                      <line x1={DIPHTHONG_INITIAL_SPLIT_X} y1="10" x2={DIPHTHONG_INITIAL_SPLIT_X} y2="100" />
                    </>
                  )}
                  {decomposed.isDiphthong && decomposed.hasJongseong && (
                    <>
                      <line x1="10" y1="140" x2="190" y2="140" />
                      <line x1="10" y1="80" x2={DIPHTHONG_INITIAL_SPLIT_X} y2="80" />
                      <line x1={DIPHTHONG_INITIAL_SPLIT_X} y1="10" x2={DIPHTHONG_INITIAL_SPLIT_X} y2="140" />
                    </>
                  )}
                </g>
              )}

              {/* 자모 요소 렌더링 */}
              {renderPaths.map((jp, i) => {
                let tf = classicTransform; // 기본적으로 클래식 모드 트랜스폼 적용
                if (isGridActive) {
                  tf = getAutoGridTransform(decomposed, jp.type, jp.bounds, 10, RENDER_SIZE);
                }
                return (
                  <path
                    key={`${jp.type}-${i}-${jp.glyphIndex ?? i}`}
                    fill={colorMap[jp.type] || '#ffffff'}
                    d={jp.pathData}
                    transform={tf || undefined}
                    style={{ transition: 'transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)' }}
                  />
                );
              })}
            </svg>
          )}

          {!loading && !error && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-[2px]">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-transform active:scale-95 flex items-center gap-2"
              >
                {copyStatus || t('syllable.copyPNG')}
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

