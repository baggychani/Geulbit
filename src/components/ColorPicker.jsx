/**
 * ColorPicker.jsx
 * 초성/중성/종성 색상 선택 컴포넌트
 * - 네이티브 color input (색상환)
 * - 헥스코드 텍스트 입력
 * - 색상 미리보기 스와치
 */

import { useState, useCallback, useEffect } from 'react';
import { useT } from '../utils/i18n';

// 사전 정의 빠른 선택 색상
const QUICK_COLORS = [
  '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#3182CE', '#805AD5',
  '#D53F8C', '#2D3748', '#718096', '#E2E8F0', '#FF6B6B', '#4ECDC4',
  '#FFE66D', '#A8EDEA', '#FED3D1', '#C3B1E1', '#1A1A1A', '#ffffff',
];

export default function ColorPicker({
  colors,
  onChange,
  layerOrderKey = 'choseong_top',
  onLayerOrderChange,
}) {
  const t = useT();

  const JAMO_LABELS = {
    choseong: { label: t('color.choseong') },
    jungseong: { label: t('color.jungseong') },
    jongseong: { label: t('color.jongseong'), desc: t('color.jongseongDesc') },
  };

  const [hexInputs, setHexInputs] = useState({
    choseong: colors.choseong,
    jungseong: colors.jungseong,
    jongseong: colors.jongseong,
  });

  const isValidHex = (hex) => /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(hex);

  const handleColorChange = useCallback((type, value) => {
    setHexInputs(prev => ({ ...prev, [type]: value }));
    if (isValidHex(value)) {
      onChange({ ...colors, [type]: value });
    }
  }, [colors, onChange]);

  const handleHexInput = useCallback((type, raw) => {
    let value = raw;
    if (!value.startsWith('#')) value = '#' + value;
    
    setHexInputs(prev => ({ ...prev, [type]: value }));
    if (isValidHex(value)) {
      onChange({ ...colors, [type]: value });
    }
  }, [colors, onChange]);

  const handleQuickColor = useCallback((type, color) => {
    setHexInputs(prev => ({ ...prev, [type]: color }));
    onChange({ ...colors, [type]: color });
  }, [colors, onChange]);

  useEffect(() => {
    setHexInputs(prev => {
      if (prev.choseong === colors.choseong && prev.jungseong === colors.jungseong && prev.jongseong === colors.jongseong) return prev;
      return { ...colors };
    });
  }, [colors]);

  return (
    <div className="flex flex-col gap-5">
      {Object.entries(JAMO_LABELS).map(([type, info]) => (
        <div key={type} className="flex flex-col gap-2">
          {/* 레이블 */}
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors[type] }}
            />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {info.label}
            </span>
            {info.desc && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ({info.desc})
              </span>
            )}
          </div>

          {/* 색상 입력 행 */}
          <div className="flex items-center gap-2">
            {/* 네이티브 color picker */}
            <label
              className="cursor-pointer flex-shrink-0"
              title={t('color.selectColor')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '2px solid var(--border-light)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: colors[type],
                transition: 'transform 0.15s',
              }}
            >
              <input
                type="color"
                value={colors[type]}
                onChange={e => handleColorChange(type, e.target.value)}
                style={{
                  width: '150%',
                  height: '150%',
                  opacity: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  left: '-25%',
                  top: '-25%',
                }}
              />
            </label>

            {/* 헥스 코드 입력 */}
            <input
              type="text"
              value={hexInputs[type]}
              onChange={e => handleHexInput(type, e.target.value)}
              maxLength={7}
              placeholder="#000000"
              className="input-field"
              style={{
                width: 100,
                fontFamily: 'monospace',
                fontSize: 13,
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}
              id={`color-${type}`}
            />
          </div>

          {/* 빠른 색상 선택 */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_COLORS.map(color => (
              <button
                key={color}
                title={color}
                onClick={() => handleQuickColor(type, color)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: color,
                  border: colors[type] === color
                    ? '2px solid white'
                    : '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transform: colors[type] === color ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.15s, border 0.15s',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 획 겹침 우선순위 */}
      <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
            {t('zorder.title')}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {t('zorder.topHint')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('zorder.title')}>
          {[
            { id: 'choseong_top', type: 'choseong', isRecommended: true },
            { id: 'jungseong_top', type: 'jungseong', isRecommended: false },
            { id: 'jongseong_top', type: 'jongseong', isRecommended: false },
          ].map((opt) => {
            const active = layerOrderKey === opt.id;
            const jamoColor = colors[opt.type];
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onLayerOrderChange && onLayerOrderChange(opt.id)}
                className="relative flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                style={{
                  background: active ? 'rgba(124, 111, 247, 0.15)' : 'var(--bg-input)',
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: active ? '0 2px 10px rgba(124, 111, 247, 0.2)' : 'none',
                }}
              >
                {opt.isRecommended && (
                  <span
                    className="absolute -top-1.5 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: 'var(--accent)',
                      color: '#ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    }}
                  >
                    {t('zorder.recommended')}
                  </span>
                )}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: jamoColor,
                    boxShadow: active ? `0 0 6px ${jamoColor}` : 'none',
                  }}
                />
                <span className="text-xs font-semibold">{t('zorder.' + opt.id)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

