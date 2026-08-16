/**
 * App.jsx
 * 한글 모아쓰기 색채 분리 도구 — 메인 앱
 */

import { useState, useEffect, useCallback } from 'react';
import { FONT_VARIANTS, LAYER_ORDERS } from './utils/fontParser';
import { parseText } from './utils/hangulDecompose';
import { DEFAULT_COLORS, PREVIEW_SIZES } from './utils/colorTemplates';
import { useT, useLang } from './utils/i18n';
import SyllableRenderer from './components/SyllableRenderer';
import ColorPicker from './components/ColorPicker';
import TemplateSelector from './components/TemplateSelector';
import ExportPanel from './components/ExportPanel';
import LogoMark from './components/LogoMark';
import { useFontManager } from './hooks/useFontManager';

// 예시 텍스트
const EXAMPLE_TEXTS = ['한글', '사랑', '봄날', '과일'];
const LANGUAGE_OPTIONS = [
  { id: 'ko', label: '한국어', activeColor: 'var(--bg-card)', activeTextColor: 'var(--text-primary)', activeBorder: '1px solid var(--border)' },
  { id: 'en', label: 'English', activeColor: '#2563eb', activeTextColor: '#ffffff', activeBorder: '1px solid #3b82f6' },
  { id: 'tr', label: 'Türkçe', activeColor: '#e11d48', activeTextColor: '#ffffff', activeBorder: '1px solid #fb7185' },
];

export default function App() {
  const t = useT();
  const [lang, setLang] = useLang();
  const {
    fontError,
    fontInfo,
    fontLoading,
    fontReady,
    fontRevision,
    fontVariant,
    fontsPreloaded,
    setFontVariant,
  } = useFontManager();

  const [text, setText] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('text') || '';
  });
  const [colors, setColors] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const c1 = params.get('c1');
    const c2 = params.get('c2');
    const c3 = params.get('c3');
    if (c1 && c2 && c3) {
      return { choseong: '#' + c1, jungseong: '#' + c2, jongseong: '#' + c3 };
    }
    return DEFAULT_COLORS;
  });
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [layerOrderKey, setLayerOrderKey] = useState('choseong_top');

  // URL 상태 동기화
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (text) params.set('text', text);
    else params.delete('text');
    params.set('c1', colors.choseong.replace('#', ''));
    params.set('c2', colors.jungseong.replace('#', ''));
    params.set('c3', colors.jongseong.replace('#', ''));
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [text, colors]);


  const [activeTab, setActiveTab] = useState('color'); // 'color' | 'template' | 'export'
  const [previewSizeId, setPreviewSizeId] = useState('M');
  const [renderMode, setRenderMode] = useState('classic'); // 'classic' | 'grid'
  const [previewBackground, setPreviewBackground] = useState('checker'); // 'checker' | 'solid'
  const [isDark, setIsDark] = useState(false);

  // 다크/라이트 모드 적용
  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  const handleTemplateSelect = useCallback((template) => {
    setColors(template.colors);
    setSelectedTemplate(template.id);
  }, []);

  const handleColorChange = useCallback((newColors) => {
    setColors(newColors);
    setSelectedTemplate(null); // 템플릿 선택 해제
  }, []);

  // 한글만 있는지 확인
  const parsedChars = parseText(text);
  const hangulChars = parsedChars.filter(c => c.isHangul);
  const hasHangul = hangulChars.length > 0;
  const previewSize = PREVIEW_SIZES.find(s => s.id === previewSizeId)?.value ?? 160;
  const activeVariant = FONT_VARIANTS[fontVariant];
  const currentLayerOrder = LAYER_ORDERS[layerOrderKey]?.order || LAYER_ORDERS.choseong_top.order;
  const activeLanguageIndex = LANGUAGE_OPTIONS.findIndex(option => option.id === lang);
  const activeLanguage = LANGUAGE_OPTIONS[activeLanguageIndex] || LANGUAGE_OPTIONS[0];
  const languageThumbTransform = [
    'translateX(0)',
    'translateX(calc(100% + 3px))',
    'translateX(calc(200% + 6px))',
  ][activeLanguageIndex] || 'translateX(0)';

  return (
    <div className="app-shell min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="app-bg-decoration" aria-hidden>
        <div className="app-bg-grid" />
      </div>

      {/* 헤더 */}
      <header
        style={{
          background: isDark ? 'rgba(15,17,23,0.95)' : 'rgba(244,246,251,0.95)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          transition: 'background 0.3s ease',
        }}
      >
        <div className="max-w-[1360px] mx-auto px-6 py-4 flex items-center justify-between gap-4 relative z-10 app-header-inner">
          {/* 왼쪽: 로고 + 타이틀 */}
          <div className="flex items-center gap-3 min-w-0">
            <LogoMark size={36} />
            <div className="min-w-0">
              <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {t('header.title')}
              </h1>
            </div>
          </div>

          {/* 오른쪽: 폰트 상태 | 굵기 | 테마 — 고정 폭으로 밀림 방지 */}
          <div className="header-controls">
            <div className="font-status-pill" title={fontError || undefined}>
              {fontLoading ? (
                <>
                  <div className="shimmer w-2 h-2 rounded-full flex-shrink-0" />
                  <span className="font-status-name" style={{ color: 'var(--text-muted)' }}>{t('font.loading')}</span>
                  <span className="font-status-meta">…</span>
                </>
              ) : fontReady ? (
                <>
                  <div className="pulse-dot" />
                  <span className="font-status-name">{fontInfo?.name || activeVariant.displayName}</span>
                  <span className="font-status-meta" title={`${fontInfo?.numGlyphs?.toLocaleString() ?? ''} glyphs`}>
                    {fontInfo?.numGlyphs != null
                      ? fontInfo.numGlyphs.toLocaleString()
                      : ''}
                  </span>
                </>
              ) : (
                <>
                  <div className="pulse-dot" style={{ background: '#f87171', animation: 'none' }} />
                  <span className="font-status-name" style={{ color: '#f87171' }}>{t('font.error')}</span>
                  <span className="font-status-meta" />
                </>
              )}
            </div>

            <div
              className="font-variant-toggle"
              role="group"
              aria-label={t('font.weight')}
              data-active={fontVariant}
            >
              <div className="segmented-thumb" aria-hidden />
              {Object.entries(FONT_VARIANTS).map(([id, variant]) => (
                <button
                  key={id}
                  type="button"
                  className={fontVariant === id ? 'active' : ''}
                  disabled={!fontsPreloaded}
                  onClick={() => setFontVariant(id)}
                  title={`${t('font.' + id)} (${variant.displayName})`}
                  id={`font-variant-${id}`}
                >
                  {t('font.' + id)}
                </button>
              ))}
            </div>

            <button
              id="theme-toggle-btn"
              onClick={() => setIsDark(d => !d)}
              title={isDark ? t('theme.toLight') : t('theme.toDark')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                transition: 'background 0.2s, transform 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* 언어 선택 */}
            <div
              className="grid grid-cols-3 gap-1 p-1 rounded-full relative"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                width: 204,
                height: 36,
              }}
              role="group"
              aria-label={t('lang.selector')}
            >
              <div
                aria-hidden
                className="absolute rounded-full shadow-sm"
                style={{
                  top: 3,
                  bottom: 3,
                  left: 3,
                  width: 'calc((100% - 12px) / 3)',
                  background: activeLanguage.activeColor,
                  border: activeLanguage.activeBorder,
                  transform: languageThumbTransform,
                  transition: 'transform 0.42s cubic-bezier(0.34, 1.2, 0.64, 1), background 0.28s ease, border-color 0.28s ease',
                  zIndex: 0,
                }}
              />
              {LANGUAGE_OPTIONS.map(option => {
                const active = lang === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setLang(option.id)}
                    aria-pressed={active}
                    className="text-center text-xs font-bold relative"
                    style={{
                      height: 28,
                      borderRadius: 99,
                      border: '1px solid transparent',
                      background: 'transparent',
                      color: active ? option.activeTextColor : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'color 0.25s',
                      zIndex: 1,
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <main className="max-w-[1360px] mx-auto px-6 py-8 relative z-10">
        <div className="flex gap-5 app-main-columns" style={{ alignItems: 'flex-start' }}>

          {/* ─── 왼쪽 패널 ─── */}
          <aside
            className="app-sidebar flex flex-col gap-5"
            style={{ width: 340, flexShrink: 0 }}
          >
            {/* 텍스트 입력 */}
            <div className="glass-card p-5 flex flex-col" style={{ minHeight: 280 }}>
              <div className="section-title">
                <span>{t('input.title')}</span>
              </div>

              <textarea
                id="text-input"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={t('input.placeholder')}
                className="input-field flex-1"
                style={{
                  resize: 'vertical',
                  fontFamily: 'Noto Sans KR, sans-serif',
                  fontSize: 15,
                  letterSpacing: '0.05em',
                  lineHeight: 1.6,
                  minHeight: 100,
                }}
              />

              {/* 예시 버튼 */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs" style={{ color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 400 }}>{t('input.examples')}</span>
                {EXAMPLE_TEXTS.map(ex => (
                  <button
                    key={ex}
                    onClick={() => setText(ex)}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 12, fontFamily: 'Noto Sans KR', fontWeight: 400 }}
                    id={`example-${ex}`}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {/* 음절 분석 요약 */}
              {text && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex flex-wrap gap-1">
                    {parsedChars.map((item, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: item.isHangul ? 'rgba(124,111,247,0.12)' : 'var(--bg-input)',
                          color: item.isHangul ? 'var(--accent)' : 'var(--text-muted)',
                          border: `1px solid ${item.isHangul ? 'rgba(124,111,247,0.3)' : 'var(--border)'}`,
                          fontFamily: 'Noto Sans KR',
                          fontSize: 13,
                        }}
                      >
                        {item.char}
                        {item.isHangul && item.decomposed && (
                          <span style={{ fontSize: 10, marginLeft: 3, opacity: 0.7 }}>
                            {item.decomposed.choseong.jamo}
                            {item.decomposed.jungseong.jamo}
                            {item.decomposed.hasJongseong ? item.decomposed.jongseong.jamo : ''}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 모드 선택 벤토 */}
            <div className="glass-card p-5">
              <div className="section-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 12 }}>
                <span>{t('mode.title')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('mode.title')}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={renderMode === 'classic'}
                  onClick={() => setRenderMode('classic')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer text-xs font-medium leading-none"
                  style={{
                    background: renderMode === 'classic' ? 'rgba(124, 111, 247, 0.15)' : 'var(--bg-input)',
                    border: `1.5px solid ${renderMode === 'classic' ? 'var(--accent)' : 'var(--border)'}`,
                    color: renderMode === 'classic' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {t('mode.classic')}
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={renderMode === 'grid'}
                  onClick={() => setRenderMode('grid')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer text-xs font-medium leading-none"
                  style={{
                    background: renderMode === 'grid' ? 'rgba(124, 111, 247, 0.15)' : 'var(--bg-input)',
                    border: `1.5px solid ${renderMode === 'grid' ? 'var(--accent)' : 'var(--border)'}`,
                    color: renderMode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {t('mode.grid')}
                </button>
              </div>
            </div>

            {/* 탭 패널 */}
            <div className="glass-card overflow-hidden">
              {/* 탭 헤더 */}
              <div
                className="flex"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                {[
                  { id: 'color', label: t('tab.color') },
                  { id: 'template', label: t('tab.template') },
                  { id: 'export', label: t('tab.export') },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    id={`tab-${tab.id}`}
                    style={{
                      flex: 1,
                      padding: '12px 6px',
                      fontSize: 12,
                      fontWeight: activeTab === tab.id ? 700 : 400,
                      color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderBottom: activeTab === tab.id
                        ? '2px solid var(--accent)'
                        : '2px solid transparent',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 탭 내용 */}
              <div className="p-5 tab-content-container">
                {activeTab === 'color' && (
                  <div className="fade-in">
                    <ColorPicker
                      colors={colors}
                      onChange={handleColorChange}
                      layerOrderKey={layerOrderKey}
                      onLayerOrderChange={setLayerOrderKey}
                    />
                  </div>
                )}
                {activeTab === 'template' && (
                  <div className="fade-in">
                    <TemplateSelector
                      selectedId={selectedTemplate}
                      onSelect={handleTemplateSelect}
                    />
                  </div>
                )}
                {activeTab === 'export' && (
                  <div className="fade-in">
                    <ExportPanel text={text} colors={colors} layerOrder={currentLayerOrder} renderMode={renderMode} />
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ─── 오른쪽: 미리보기 패널 ─── */}
          <section className="flex-1 flex flex-col gap-5" style={{ minWidth: 0 }}>
            {/* 미리보기 헤더 */}
            <div className="glass-card p-5 flex flex-col" style={{ minHeight: 280 }}>
              <div className="flex items-start justify-between mb-0.5">
                <div className="section-title" style={{ paddingBottom: 0, borderBottom: 'none', marginBottom: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{t('preview.title')}</span>
                  {hasHangul && (
                    <span className="badge">{hangulChars.length} {t('preview.syllableCount')}</span>
                  )}
                </div>

                <div className="preview-toolbar">
                  <div className="preview-background-toggle" role="group" aria-label={t('preview.background')}>
                    <button
                      type="button"
                      className={previewBackground === 'checker' ? 'active' : ''}
                      onClick={() => setPreviewBackground('checker')}
                      aria-label={t('preview.checkerBackground')}
                      aria-pressed={previewBackground === 'checker'}
                      title={t('preview.checkerBackground')}
                    >
                      <span className="preview-background-swatch preview-background-swatch-checker" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={previewBackground === 'solid' ? 'active' : ''}
                      onClick={() => setPreviewBackground('solid')}
                      aria-label={t('preview.solidBackground')}
                      aria-pressed={previewBackground === 'solid'}
                      title={t('preview.solidBackground')}
                    >
                      <span className="preview-background-swatch preview-background-swatch-solid" aria-hidden />
                    </button>
                  </div>

                  {/* 미리보기 크기 */}
                  <div
                    className="preview-size-toggle"
                    role="group"
                    aria-label={t('preview.size')}
                    data-active={previewSizeId}
                  >
                    <div className="segmented-thumb" aria-hidden />
                    {PREVIEW_SIZES.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        className={previewSizeId === s.id ? 'active' : ''}
                        onClick={() => setPreviewSizeId(s.id)}
                        id={`preview-size-${s.id}`}
                        title={s.label}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 색상 범례 */}
              <div className="flex gap-3.5 mb-2.5" style={{ marginTop: -2 }}>
                {[
                  { label: t('legend.choseong'), color: colors.choseong },
                  { label: t('legend.jungseong'), color: colors.jungseong },
                  { label: t('legend.jongseong'), color: colors.jongseong },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: 3,
                        background: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 400, letterSpacing: '-0.01em' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* 글자 미리보기 영역 */}
              {!fontReady && !fontLoading && (
                <div
                  className="flex items-center justify-center rounded-xl py-16"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚠️</div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {fontError || t('font.loadFailed')}
                    </p>
                  </div>
                </div>
              )}

              {fontLoading && (
                <div
                  className="flex flex-col items-center justify-center rounded-xl py-16 gap-4"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                >
                  <div className="shimmer w-24 h-24 rounded-xl" />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {t('font.loadingMsg')}
                  </p>
                </div>
              )}

              {fontReady && (
                <>
                  {!hasHangul ? (
                    <div
                      className="flex-1 flex items-center justify-center rounded-xl min-h-[140px]"
                      style={{ background: 'var(--bg-input)', border: '1px dashed var(--border-light)' }}
                    >
                      <div className="text-center">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {t('preview.enterHangul')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="preview-stage"
                      style={{
                        justifyContent: hangulChars.length === 1 ? 'center' : 'flex-start',
                      }}
                    >
                      {hangulChars.map((item, i) => (
                        <SyllableRenderer
                          key={`${item.char}-${i}`}
                          char={item.char}
                          colors={colors}
                          displaySize={previewSize}
                          fontRevision={fontRevision}
                          layerOrder={currentLayerOrder}
                          renderMode={renderMode}
                          previewBackground={previewBackground}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>


            {/* 디버그 / 분석 정보 */}
            {fontReady && hasHangul && (
              <div className="glass-card p-5">
                <div className="section-title">
                  <span>{t('analysis.title')}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {hangulChars.map((item, i) => {
                    const d = item.decomposed;
                    if (!d) return null;
                    return (
                      <div
                        key={i}
                        className="flex flex-wrap items-center gap-3 p-3 rounded-xl"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                      >
                        {/* 글자 */}
                        <div
                          className="text-3xl font-bold flex-shrink-0"
                          style={{ fontFamily: 'Noto Sans KR', color: 'var(--text-primary)', width: 50, textAlign: 'center' }}
                        >
                          {item.char}
                        </div>

                        {/* 화살표 */}
                        <div style={{ color: 'var(--text-muted)', fontSize: 20 }}>→</div>

                        {/* 자소 분해 */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="jamo-tag text-sm"
                            style={{
                              color: colors.choseong,
                              borderColor: colors.choseong + '60',
                              background: colors.choseong + '18',
                            }}
                          >
                            {t('analysis.choseong')}: {d.choseong.jamo}
                          </span>
                          <span
                            className="jamo-tag text-sm"
                            style={{
                              color: colors.jungseong,
                              borderColor: colors.jungseong + '60',
                              background: colors.jungseong + '18',
                            }}
                          >
                            {t('analysis.jungseong')}: {d.jungseong.jamo}
                          </span>
                          {d.hasJongseong && (
                            <span
                              className="jamo-tag text-sm"
                              style={{
                                color: colors.jongseong,
                                borderColor: colors.jongseong + '60',
                                background: colors.jongseong + '18',
                              }}
                            >
                              {t('analysis.jongseong')}: {d.jongseong.jamo}
                            </span>
                          )}
                          {!d.hasJongseong && (
                            <span
                              className="jamo-tag text-sm"
                              style={{
                                color: 'var(--text-muted)',
                                borderColor: 'var(--border)',
                                background: 'var(--bg-input)',
                                opacity: 0.5,
                              }}
                            >
                              {t('analysis.noJongseong')}
                            </span>
                          )}
                        </div>

                        {/* 모음 방향 */}
                        <div className="ml-auto flex-shrink-0">
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            {d.isVerticalVowel ? t('analysis.verticalVowel') : t('analysis.horizontalVowel')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 사용 안내 */}
            {!hasHangul && !fontLoading && (
              <div className="glass-card p-5">
                <div className="section-title">
                  <span>{t('howto.title')}</span>
                </div>
                <ol className="flex flex-col gap-2">
                  {[
                    t('howto.step1'),
                    t('howto.step2'),
                    t('howto.step3'),
                    t('howto.step4'),
                    t('howto.step5'),
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'var(--accent-glow)',
                          border: '1px solid rgba(124,111,247,0.4)',
                          color: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer
        className="text-center py-6 mt-4 relative z-10"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12 }}
      >
        Bae Gichan 배기찬 · Woo Jiin 우지인
        <span className="mx-2">·</span>
        2026
      </footer>
    </div>
  );
}
