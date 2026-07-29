/**
 * ColorPicker.jsx
 * 초성/중성/종성 색상 선택 컴포넌트
 * - 네이티브 color input (색상환)
 * - 헥스코드 텍스트 입력
 * - 색상 미리보기 스와치
 */

import React, { useState, useCallback, useEffect } from 'react';
import { LAYER_ORDERS } from '../utils/fontParser';
import { useT } from '../utils/i18n';

// 사전 정의 빠른 선택 색상
const QUICK_COLORS = [
  '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#3182CE', '#805AD5',
  '#D53F8C', '#2D3748', '#718096', '#E2E8F0', '#FF6B6B', '#4ECDC4',
  '#FFE66D', '#A8EDEA', '#FED3D1', '#C3B1E1', '#1A1A1A', '#ffffff',
];

export default function ColorPicker({ colors, onChange, layerOrderKey = 'choseong_top', onLayerOrderChange }) {
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
    setHexInputs({
      choseong: colors.choseong,
      jungseong: colors.jungseong,
      jongseong: colors.jongseong,
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

      {/* 레이어 겹침 순서 (Z-Order) */}
      <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-2">
        <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
          {t('zorder.title')}
        </span>
        <div className="flex flex-col gap-1.5">
          {Object.values(LAYER_ORDERS).map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2 text-xs p-2 rounded-lg cursor-pointer transition-colors"
              style={{
                background: layerOrderKey === opt.id ? 'rgba(124,111,247,0.15)' : 'var(--bg-input)',
                border: `1px solid ${layerOrderKey === opt.id ? 'var(--accent)' : 'var(--border)'}`,
                color: layerOrderKey === opt.id ? 'var(--accent-light)' : 'var(--text-primary)',
              }}
            >
              <input
                type="radio"
                name="layerOrder"
                value={opt.id}
                checked={layerOrderKey === opt.id}
                onChange={() => onLayerOrderChange && onLayerOrderChange(opt.id)}
                className="w-3.5 h-3.5"
              />
              <span className="font-semibold">{t('zorder.' + opt.id)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

