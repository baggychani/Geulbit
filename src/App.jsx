/**
 * App.jsx
 * 한글 모아쓰기 색채 분리 도구 — 메인 앱
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { loadFont, loadFontFromBuffer, getFont } from './utils/fontParser';
import { parseText } from './utils/hangulDecompose';
import { DEFAULT_COLORS, COLOR_TEMPLATES } from './utils/colorTemplates';
import SyllableRenderer from './components/SyllableRenderer';
import ColorPicker from './components/ColorPicker';
import TemplateSelector from './components/TemplateSelector';
import ExportPanel from './components/ExportPanel';

// 예시 텍스트
const EXAMPLE_TEXTS = ['한글', '사랑', '학교', '봄날'];

export default function App() {
  const [fontReady, setFontReady] = useState(false);
  const [fontError, setFontError] = useState(null);
  const [fontLoading, setFontLoading] = useState(true);
  const [fontInfo, setFontInfo] = useState(null);

  const [text, setText] = useState('한글');
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  const [activeTab, setActiveTab] = useState('color'); // 'color' | 'template' | 'export'
  const [previewSize, setPreviewSize] = useState(160);
  const [isDark, setIsDark] = useState(false);

  const fileInputRef = useRef(null);

  // 다크/라이트 모드 적용
  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  // 폰트 로드
  useEffect(() => {
    async function initFont() {
      setFontLoading(true);
      try {
        const font = await loadFont('/UnDotum.ttf');
        setFontInfo({
          name: font.names?.postScriptName?.en || 'UnDotum',
          numGlyphs: font.numGlyphs,
          unitsPerEm: font.unitsPerEm,
        });
        setFontReady(true);
      } catch (err) {
        console.error('[App] 폰트 로드 실패:', err);
        setFontError(err.message);
      }
      setFontLoading(false);
    }
    initFont();
  }, []);

  const handleTemplateSelect = useCallback((template) => {
    setColors(template.colors);
    setSelectedTemplate(template.id);
  }, []);

  const handleColorChange = useCallback((newColors) => {
    setColors(newColors);
    setSelectedTemplate(null); // 템플릿 선택 해제
  }, []);

  const handleFontUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFontLoading(true);
    setFontError(null);
    try {
      const buffer = await file.arrayBuffer();
      const font = await loadFontFromBuffer(buffer);
      setFontInfo({
        name: font.names?.postScriptName?.en || file.name,
        numGlyphs: font.numGlyphs,
        unitsPerEm: font.unitsPerEm,
      });
      setFontReady(true);
      // 텍스트 재렌더링 트리거
      setText(prev => prev);
    } catch (err) {
      setFontError(`폰트 로드 실패: ${err.message}`);
    }
    setFontLoading(false);
  }, []);

  // 한글만 있는지 확인
  const parsedChars = parseText(text);
  const hangulChars = parsedChars.filter(c => c.isHangul);
  const hasHangul = hangulChars.length > 0;

  // 미리보기 크기 조절
  const previewSizes = [
    { label: 'S', value: 100 },
    { label: 'M', value: 160 },
    { label: 'L', value: 220 },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* 왼쪽: 로고 + 타이틀 */}
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #7c6ff7, #9b59d5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'serif',
                flexShrink: 0,
              }}
            >
              가
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
                글빛 — 한글 팔레트
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                초성·중성·종성 컬러 이미지 스튜디오
              </p>
            </div>
          </div>

          {/* 오른쪽: 제작자 + 다크모드 토글 + 폰트 상태 + 업로드 */}
          <div className="flex items-center gap-3">
            {/* 제작자 */}
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textAlign: 'right',
                lineHeight: 1.5,
                paddingRight: 4,
                borderRight: '1px solid var(--border)',
                marginRight: 4,
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Woo Jiin · Bae Gichan</div>
              <div>© 2026</div>
            </div>

            {/* 다크/라이트 모드 토글 */}
            <button
              id="theme-toggle-btn"
              onClick={() => setIsDark(d => !d)}
              title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
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
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            {/* 폰트 상태 */}
            {fontLoading ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="shimmer w-4 h-4 rounded-full" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>폰트 로딩 중...</span>
              </div>
            ) : fontReady ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div className="pulse-dot" />
                <span className="text-xs font-medium" style={{ color: '#4ade80' }}>
                  {fontInfo?.name}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {fontInfo?.numGlyphs?.toLocaleString()}글리프
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <span style={{ color: '#f87171', fontSize: 12 }}>⚠ 폰트 오류</span>
              </div>
            )}

            {/* 폰트 업로드 버튼 */}
            <button
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => fileInputRef.current?.click()}
              title="다른 TTF 폰트 파일 업로드"
              id="upload-font-btn"
            >
              📂 폰트 교체
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              style={{ display: 'none' }}
              onChange={handleFontUpload}
            />
          </div>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>

          {/* ─── 왼쪽 패널 ─── */}
          <aside
            className="flex flex-col gap-5"
            style={{ width: 320, flexShrink: 0 }}
          >
            {/* 텍스트 입력 */}
            <div className="glass-card p-5">
              <div className="section-title">
                <span>✏️</span>
                <span>글자 입력</span>
              </div>

              <textarea
                id="text-input"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="한글을 입력하세요&#10;예: 한글"
                className="input-field"
                style={{
                  height: 100,
                  resize: 'vertical',
                  fontFamily: 'Noto Sans KR, sans-serif',
                  fontSize: 22,
                  letterSpacing: '0.05em',
                  lineHeight: 1.6,
                }}
              />

              {/* 예시 버튼 */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs" style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>예시:</span>
                {EXAMPLE_TEXTS.map(ex => (
                  <button
                    key={ex}
                    onClick={() => setText(ex)}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 12, fontFamily: 'Noto Sans KR' }}
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

            {/* 탭 패널 */}
            <div className="glass-card overflow-hidden">
              {/* 탭 헤더 */}
              <div
                className="flex"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                {[
                  { id: 'color', label: '🎨 색상', title: '초성/중성/종성 색상 설정' },
                  { id: 'template', label: '🗂 템플릿', title: '색상 템플릿 선택' },
                  { id: 'export', label: '💾 내보내기', title: '이미지 다운로드' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    title={tab.title}
                    id={`tab-${tab.id}`}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
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
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 탭 내용 */}
              <div className="p-5">
                {activeTab === 'color' && (
                  <div className="fade-in">
                    <ColorPicker colors={colors} onChange={handleColorChange} />
                  </div>
                )}
                {activeTab === 'template' && (
                  <div className="fade-in">
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                      미리 정의된 색 조합을 선택하세요
                    </p>
                    <TemplateSelector
                      selectedId={selectedTemplate}
                      onSelect={handleTemplateSelect}
                    />
                  </div>
                )}
                {activeTab === 'export' && (
                  <div className="fade-in">
                    <ExportPanel text={text} colors={colors} />
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ─── 오른쪽: 미리보기 패널 ─── */}
          <section className="flex-1 flex flex-col gap-5" style={{ minWidth: 0 }}>
            {/* 미리보기 헤더 */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="section-title" style={{ paddingBottom: 0, borderBottom: 'none', marginBottom: 0 }}>
                  <span>👁️</span>
                  <span>미리보기</span>
                  {hasHangul && (
                    <span className="badge">{hangulChars.length}음절</span>
                  )}
                </div>

                {/* 미리보기 크기 */}
                <div className="flex gap-1">
                  {previewSizes.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setPreviewSize(s.value)}
                      className={previewSize === s.value ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '4px 10px', fontSize: 11, minWidth: 32 }}
                      id={`preview-size-${s.label}`}
                      title={`미리보기 크기 ${s.label}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 색상 범례 */}
              <div className="flex gap-4 mb-5">
                {[
                  { label: '초성 (첫 자음)', color: colors.choseong },
                  { label: '중성 (모음)', color: colors.jungseong },
                  { label: '종성 (받침)', color: colors.jongseong },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 4,
                        background: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
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
                      {fontError || '폰트를 로드할 수 없습니다.'}
                    </p>
                    <button
                      className="btn-secondary mt-3"
                      style={{ fontSize: 12 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      폰트 업로드
                    </button>
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
                    UnDotum 폰트 로딩 중...
                  </p>
                </div>
              )}

              {fontReady && (
                <>
                  {!hasHangul ? (
                    <div
                      className="flex items-center justify-center rounded-xl py-16"
                      style={{ background: 'var(--bg-input)', border: '1px dashed var(--border-light)' }}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3">✏️</div>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          왼쪽 입력창에 한글을 입력하세요
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                          받침 있는 글자도 완벽히 분리됩니다
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex flex-wrap gap-6 p-6 rounded-xl"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        minHeight: 220,
                        alignItems: 'center',
                        justifyContent: hangulChars.length === 1 ? 'center' : 'flex-start',
                      }}
                    >
                      {hangulChars.map((item, i) => (
                        <SyllableRenderer
                          key={`${item.char}-${i}`}
                          char={item.char}
                          colors={colors}
                          displaySize={previewSize}
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
                  <span>🔬</span>
                  <span>음절 분석 정보</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {hangulChars.map((item, i) => {
                    const d = item.decomposed;
                    if (!d) return null;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-3 rounded-xl fade-in"
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
                            초성: {d.choseong.jamo}
                          </span>
                          <span
                            className="jamo-tag text-sm"
                            style={{
                              color: colors.jungseong,
                              borderColor: colors.jungseong + '60',
                              background: colors.jungseong + '18',
                            }}
                          >
                            중성: {d.jungseong.jamo}
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
                              종성: {d.jongseong.jamo}
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
                              종성: 없음
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
                            {d.isVerticalVowel ? '↕ 수직모음' : '↔ 수평모음'}
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
                  <span>💡</span>
                  <span>사용 방법</span>
                </div>
                <ol className="flex flex-col gap-2">
                  {[
                    '왼쪽 "글자 입력" 창에 한글을 입력합니다.',
                    '"색상" 탭에서 초성·중성·종성의 색을 각각 설정하거나,',
                    '"템플릿" 탭에서 미리 정의된 색 조합을 선택합니다.',
                    '미리보기에서 색채가 분리된 글자를 확인합니다.',
                    '"내보내기" 탭에서 SVG 또는 투명 PNG로 다운로드합니다.',
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

      {/* 푸터 */}
      <footer
        className="text-center py-6 mt-8"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12 }}
      >
        한글 모아쓰기 색채 분리 도구 · UnDotum 폰트 기반 · 교사 전용
        <span className="mx-2">·</span>
        복합 글리프 직접 분해 방식 (opentype.js)
      </footer>
    </div>
  );
}
