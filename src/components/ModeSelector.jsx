import { useEffect, useState } from 'react';
import {
  extractJamoPaths,
  loadFont,
  getFontByVariant,
  getGlyphBoundingBox,
  sortJamoPaths,
  DEFAULT_LAYER_ORDER,
  getAutoGridTransform,
  FONT_VARIANTS,
} from '../utils/fontParser';
import { decomposeHangul } from '../utils/hangulDecompose';
import { useT } from '../utils/i18n';

const RENDER_SIZE = 200;
const SAMPLE_CHAR = '빛';

function MiniGlyphPreview({ mode, colors, layerOrder, fontRevision }) {
  const [paths, setPaths] = useState(null);
  const [bbox, setBbox] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadBoldSample() {
      try {
        let boldFont = getFontByVariant('bold');
        if (!boldFont) {
          boldFont = await loadFont(FONT_VARIANTS.bold.url);
        }
        if (!boldFont || !active) return;

        const jamoPaths = extractJamoPaths(SAMPLE_CHAR, RENDER_SIZE, boldFont);
        const bb = getGlyphBoundingBox(SAMPLE_CHAR, RENDER_SIZE, boldFont);

        if (jamoPaths && jamoPaths.length > 0 && active) {
          setPaths(jamoPaths);
          setBbox(bb);
          setLoaded(true);
        }
      } catch (err) {
        console.error('[MiniGlyphPreview] 로드 실패:', err);
      }
    }

    loadBoldSample();

    return () => {
      active = false;
    };
  }, [fontRevision]);

  const decomposed = decomposeHangul(SAMPLE_CHAR);
  const isGrid = mode === 'grid';

  const colorMap = {
    choseong: colors?.choseong || '#7C6FF7',
    jungseong: colors?.jungseong || '#38BDF8',
    jongseong: colors?.jongseong || '#F472B6',
  };

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
      const scale = Math.min(targetW / bw, targetH / bh, 1);
      const tx = (RENDER_SIZE / 2) - cx * scale;
      const ty = (RENDER_SIZE / 2) - cy * scale;
      classicTransform = `translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${scale.toFixed(3)})`;
    }
  }

  const renderPaths = paths ? sortJamoPaths(paths, layerOrder || DEFAULT_LAYER_ORDER) : [];

  return (
    <div
      className="w-[72px] h-[72px] rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--preview-solid-bg)',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--border)',
      }}
      aria-hidden="true"
    >
      {loaded && renderPaths.length > 0 ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${RENDER_SIZE} ${RENDER_SIZE}`}
          className="w-[58px] h-[58px] transition-transform duration-200"
        >
          {isGrid && (
            <g stroke="var(--border-light)" strokeWidth="3.5" fill="none" opacity="0.85">
              <rect x="10" y="10" width="180" height="180" rx="12" />
              <line x1="100" y1="10" x2="100" y2="100" />
              <line x1="10" y1="100" x2="190" y2="100" />
            </g>
          )}

          {renderPaths.map((jp, i) => {
            const tf = isGrid
              ? getAutoGridTransform(decomposed, jp.type, jp.bounds, 10, RENDER_SIZE)
              : classicTransform;
            return (
              <path
                key={`${jp.type}-${i}`}
                fill={colorMap[jp.type] || '#ffffff'}
                d={jp.pathData}
                transform={tf || undefined}
              />
            );
          })}
        </svg>
      ) : (
        <div className="text-base font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>
          빛
        </div>
      )}
    </div>
  );
}

export default function ModeSelector({
  renderMode,
  onChange,
  colors,
  layerOrder,
  fontRevision = 0,
}) {
  const t = useT();

  const modes = [
    {
      id: 'classic',
      label: t('mode.classic'),
    },
    {
      id: 'grid',
      label: t('mode.grid'),
    },
  ];

  return (
    <div className="glass-card p-5">
      <div className="section-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 12 }}>
        <span>{t('mode.title')}</span>
      </div>

      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t('mode.title')}>
        {modes.map((mode) => {
          const isSelected = renderMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(mode.id)}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all duration-200 cursor-pointer text-center relative group select-none"
              style={{
                background: isSelected ? 'rgba(124, 111, 247, 0.14)' : 'var(--bg-input)',
                border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                boxShadow: isSelected ? '0 4px 16px var(--accent-glow)' : 'none',
              }}
            >
              {/* 예시 그림 ("빛" 글자 기반 시각적 프리뷰 - 굵게 고정 및 비동기 안전 로드) */}
              <MiniGlyphPreview
                mode={mode.id}
                colors={colors}
                layerOrder={layerOrder}
                fontRevision={fontRevision}
              />

              {/* 모드 명칭 라벨 */}
              <span
                className="mt-2.5 text-xs font-semibold tracking-tight transition-colors duration-200"
                style={{
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {mode.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
