/**
 * SyllableAnalysis.jsx
 * 가로형 컴팩트 글자 칩 리스트 및 선택 시 상세 정보 인스펙터
 */

import { useState, useEffect } from 'react';
import { useT } from '../utils/i18n';

export default function SyllableAnalysis({ hangulChars = [], colors }) {
  const t = useT();
  const [selectedIndex, setSelectedIndex] = useState(null);

  // 글자 목록이 바뀌었을 때 인덱스 보정
  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= hangulChars.length) {
      setSelectedIndex(hangulChars.length > 0 ? 0 : null);
    }
  }, [hangulChars.length, selectedIndex]);

  if (!hangulChars || hangulChars.length === 0) return null;

  const handleChipClick = (index) => {
    setSelectedIndex(prev => (prev === index ? null : index));
  };

  const selectedItem = selectedIndex !== null ? hangulChars[selectedIndex] : null;
  const d = selectedItem?.decomposed;

  return (
    <div className="glass-card p-5 syllable-analysis-card">
      <div className="section-title flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-2">
          <span>{t('analysis.title')}</span>
          <span className="badge">{hangulChars.length}</span>
        </div>
        {selectedIndex !== null && (
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            className="text-xs"
            style={{
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            접기
          </button>
        )}
      </div>

      {/* 가로형 컴팩트 글자 칩 리스트 */}
      <div className="syllable-chips-grid">
        {hangulChars.map((item, i) => {
          const isSelected = selectedIndex === i;
          return (
            <button
              key={`${item.char}-${i}`}
              type="button"
              onClick={() => handleChipClick(i)}
              className={`syllable-chip ${isSelected ? 'active' : ''}`}
              title={`${item.char} (${i + 1}번째 글자)`}
              aria-pressed={isSelected}
            >
              <span className="syllable-chip-char">{item.char}</span>
            </button>
          );
        })}
      </div>

      {/* 선택된 음절 상세 정보 (인스펙터) */}
      {selectedItem && d && (
        <div className="syllable-detail-panel fade-in mt-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* 대표 글자 표시 */}
            <div className="syllable-detail-main-char">
              {selectedItem.char}
            </div>

            <div className="text-xl font-light" style={{ color: 'var(--text-muted)' }}>→</div>

            {/* 초성 / 중성 / 종성 태그들 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="jamo-tag text-sm"
                style={{
                  color: colors.choseong,
                  borderColor: colors.choseong + '60',
                  background: colors.choseong + '18',
                }}
              >
                {t('analysis.choseong')}: <strong>{d.choseong.jamo}</strong>
              </span>

              <span
                className="jamo-tag text-sm"
                style={{
                  color: colors.jungseong,
                  borderColor: colors.jungseong + '60',
                  background: colors.jungseong + '18',
                }}
              >
                {t('analysis.jungseong')}: <strong>{d.jungseong.jamo}</strong>
              </span>

              {d.hasJongseong ? (
                <span
                  className="jamo-tag text-sm"
                  style={{
                    color: colors.jongseong,
                    borderColor: colors.jongseong + '60',
                    background: colors.jongseong + '18',
                  }}
                >
                  {t('analysis.jongseong')}: <strong>{d.jongseong.jamo}</strong>
                </span>
              ) : (
                <span
                  className="jamo-tag text-sm"
                  style={{
                    color: 'var(--text-muted)',
                    borderColor: 'var(--border)',
                    background: 'var(--bg-secondary)',
                    opacity: 0.7,
                  }}
                >
                  {t('analysis.noJongseong')}
                </span>
              )}
            </div>

            {/* 모음 방향 뱃지 */}
            <div className="ml-auto flex-shrink-0">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {d.isVerticalVowel ? t('analysis.verticalVowel') : t('analysis.horizontalVowel')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
