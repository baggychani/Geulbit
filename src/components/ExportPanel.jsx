/**
 * ExportPanel.jsx
 * SVG/PNG 내보내기 — 브라우저 기본 다운로드(다운로드 폴더)만 사용
 */

import { useState, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { exportSVG, exportPNG } from '../utils/imageExport';
import { parseText } from '../utils/hangulDecompose';
import { useT } from '../utils/i18n';

const SIZE_OPTIONS = [
  { id: '200', label: '200', value: 200, title: '200px' },
  { id: '300', label: '300', value: 300, title: '300px' },
  { id: '500', label: '500', value: 500, title: '500px' },
  { id: '800', label: '800', value: 800, title: '800px' },
  { id: '1200', label: '1200', value: 1200, title: '1200px' },
];

const EXPORT_CANCELLED = 'export-cancelled';
const YIELD_EVERY = 4;
const EXPORT_FORMATS = {
  png: {
    create: exportPNG,
    errorMessage: 'PNG 변환 실패',
    perFileDelay: 200,
    successKey: 'export.pngStarted',
    toBlob: (content) => content,
  },
  svg: {
    create: exportSVG,
    errorMessage: 'SVG 생성 실패',
    perFileDelay: 150,
    successKey: 'export.svgStarted',
    toBlob: (content) => new Blob([content], { type: 'image/svg+xml;charset=utf-8' }),
  },
};

/** Blob을 파일 이름으로 바로 다운로드 (File System Access API 미사용) */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function throwIfExportCancelled(cancelRequested) {
  if (!cancelRequested) return;
  const error = new Error(EXPORT_CANCELLED);
  error.code = EXPORT_CANCELLED;
  throw error;
}

/** ZIP 파일명용: 입력 순서대로 한글만 이어 붙임 (예: 안녕하세요 → 안녕하세요) */
function buildExportBaseName(text) {
  const sanitized = (text || '')
    .normalize('NFC')
    .replace(/[<>:"/\\|?*\p{Cc}]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/^[.\-\s]+|[.\-\s]+$/g, '')
    .slice(0, 80);
  return sanitized || '한글';
}

function buildExportFilename({ text, char, outputSize, type, renderMode, archive = false, sourceIndex = null }) {
  const modePrefix = renderMode === 'grid' ? '자모그리드' : '모아쓰기';
  const target = char || buildExportBaseName(text);
  const sequenceSuffix = sourceIndex == null ? '' : `_${sourceIndex + 1}`;
  const base = `${modePrefix}_${target}${sequenceSuffix}`;

  if (archive) {
    return type === 'png'
      ? `${base}_${outputSize}px_PNG.zip`
      : `${base}_SVG.zip`;
  }

  return type === 'png'
    ? `${base}_${outputSize}px.png`
    : `${base}.svg`;
}

export default function ExportPanel({ text, colors, layerOrder, renderMode = 'classic' }) {
  const t = useT();
  const [outputSize, setOutputSize] = useState(1200);
  const [useZip, setUseZip] = useState(true);
  const [deduplicate, setDeduplicate] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [exportProgress, setExportProgress] = useState(null);
  const [message, setMessage] = useState(null);
  const cancelRequestedRef = useRef(false);

  let syllables = parseText(text || '').filter(t => t.isHangul);
  if (deduplicate) {
    const seen = new Set();
    syllables = syllables.filter(syl => {
      if (seen.has(syl.char)) return false;
      seen.add(syl.char);
      return true;
    });
  }
  const showMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const exportManyAsZip = useCallback(async (addToZip) => {
    const zip = new JSZip();
    const failedChars = [];
    for (let index = 0; index < syllables.length; index += 1) {
      throwIfExportCancelled(cancelRequestedRef.current);

      const char = syllables[index].char;
      let added = false;
      let failed = false;
      try {
        added = await addToZip(zip, char, index);
      } catch (error) {
        if (error.code === EXPORT_CANCELLED) throw error;
        failed = true;
        console.error(`[ExportPanel] ${char} export failed`, error);
        failedChars.push(char);
      }
      throwIfExportCancelled(cancelRequestedRef.current);
      if (!added && !failed) failedChars.push(char);

      setExportProgress({ current: index + 1, total: syllables.length });
      if ((index + 1) % YIELD_EVERY === 0) await delay(0);
    }

    if (failedChars.length > 0) {
      throw new Error(`${t('export.failedChars')}: ${failedChars.join(', ')}`);
    }

    return zip.generateAsync({ type: 'blob' });
  }, [syllables, t]);

  const handleExport = useCallback(async (type) => {
    const format = EXPORT_FORMATS[type];
    if (syllables.length === 0) {
      showMessage(t('export.noHangul'), 'error');
      return;
    }
    cancelRequestedRef.current = false;
    setExporting(type);
    setExportProgress({ current: 0, total: syllables.length });

    const render = (char) => format.create(char, colors, outputSize, layerOrder, renderMode);
    const downloadSingleFile = async (char, index) => {
      const content = await render(char);
      if (!content) return false;
      throwIfExportCancelled(cancelRequestedRef.current);
      downloadBlob(format.toBlob(content), buildExportFilename({
        text,
        char,
        outputSize,
        type,
        renderMode,
        sourceIndex: deduplicate ? null : index,
      }));
      return true;
    };

    try {
      if (syllables.length === 1) {
        if (!await downloadSingleFile(syllables[0].char, 0)) throw new Error(format.errorMessage);
        setExportProgress({ current: 1, total: 1 });
      } else if (useZip) {
        const blob = await exportManyAsZip(async (zip, char, index) => {
          const content = await render(char);
          if (!content) return false;
          throwIfExportCancelled(cancelRequestedRef.current);
          zip.file(buildExportFilename({
            text,
            char,
            outputSize,
            type,
            renderMode,
            sourceIndex: deduplicate ? null : index,
          }), format.toBlob(content));
          return true;
        });
        throwIfExportCancelled(cancelRequestedRef.current);
        downloadBlob(blob, buildExportFilename({ text, outputSize, type, renderMode, archive: true }));
      } else {
        const failedChars = [];
        for (let index = 0; index < syllables.length; index += 1) {
          throwIfExportCancelled(cancelRequestedRef.current);
          const succeeded = await downloadSingleFile(syllables[index].char, index);
          if (!succeeded) failedChars.push(syllables[index].char);
          setExportProgress({ current: index + 1, total: syllables.length });
          await delay(format.perFileDelay);
        }
        if (failedChars.length > 0) throw new Error(`${t('export.failedChars')}: ${failedChars.join(', ')}`);
      }
      showMessage(t(format.successKey));
    } catch (error) {
      if (error.code === EXPORT_CANCELLED) {
        showMessage(t('export.cancelled'));
      } else {
        console.error(error);
        const message = error instanceof Error ? error.message : String(error);
        showMessage(`${t('export.errorPrefix')}: ${message}`, 'error');
      }
    } finally {
      setExporting(null);
      setExportProgress(null);
      cancelRequestedRef.current = false;
    }
  }, [syllables, colors, outputSize, useZip, exportManyAsZip, text, layerOrder, renderMode, t]);

  const handleCancelExport = useCallback(() => {
    cancelRequestedRef.current = true;
  }, []);
  return (
    <div className="export-panel flex flex-col gap-4">
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <span className="label-text" style={{ marginBottom: 0 }}>{t('export.outputSize')}</span>
          <span className="export-size-current">{outputSize}px</span>
        </div>
        <div className="export-size-row" role="radiogroup" aria-label={t('export.outputSize')}>
          {SIZE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={outputSize === opt.value}
              title={opt.title}
              onClick={() => setOutputSize(opt.value)}
              className={`export-size-chip ${outputSize === opt.value ? 'active' : ''}`}
              id={`size-${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="export-zip-block">
        <span className="label-text block mb-3">{t('export.multiTitle')}</span>
        
        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={useZip}
              onChange={e => setUseZip(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <span className="flex-1 min-w-0">
              {t('export.zipLabel')}
              <span
                className="block text-xs mt-1 export-zip-hint"
                style={{ color: 'var(--text-muted)' }}
              >
                {useZip
                  ? t('export.zipHintOn')
                  : t('export.zipHintOff')}
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={deduplicate}
              onChange={e => setDeduplicate(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <span className="flex-1 min-w-0">
              {t('export.dedupeLabel')}
              <span
                className="block text-xs mt-1 export-zip-hint"
                style={{ color: 'var(--text-muted)' }}
              >
                {t('export.dedupeHint')}
              </span>
            </span>
          </label>
        </div>
      </div>

      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(124,111,247,0.08)', border: '1px solid rgba(124,111,247,0.2)' }}
      >
        <div className="preview-bg-checker w-5 h-5 rounded flex-shrink-0" style={{ backgroundSize: '6px 6px' }} />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {t('export.transparentNote')}
        </span>
      </div>

      {exporting && exportProgress && (
        <div
          className="rounded-xl px-3 py-3"
          style={{ background: 'rgba(124,111,247,0.08)', border: '1px solid rgba(124,111,247,0.24)' }}
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('export.inProgress')} · {exporting.toUpperCase()}
            </span>
            <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
              {exportProgress.current} / {exportProgress.total}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${Math.round((exportProgress.current / exportProgress.total) * 100)}%`,
                background: 'linear-gradient(90deg, var(--accent), #a78bfa)',
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleCancelExport}
            className="mt-3 text-xs font-semibold transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            {t('export.cancel')}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="btn-primary w-full justify-center"
          onClick={() => handleExport('svg')}
          disabled={!!exporting || syllables.length === 0}
          id="export-svg-btn"
        >
          <span className="inline-flex items-center justify-center w-5 h-5 flex-shrink-0">
            {exporting === 'svg' ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
          </span>
          <span>{t('export.svgDownload')}</span>
        </button>

        <button
          type="button"
          className="btn-secondary w-full justify-center"
          onClick={() => handleExport('png')}
          disabled={!!exporting || syllables.length === 0}
          id="export-png-btn"
        >
          <span className="inline-flex items-center justify-center w-5 h-5 flex-shrink-0">
            {exporting === 'png' ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
          </span>
          <span>{t('export.pngDownload')}</span>
        </button>
      </div>

      <div className="export-panel-feedback" aria-live="polite">
        {message ? (
          <div
            className="text-sm px-3 py-2 rounded-lg text-center w-full transition-opacity duration-200"
            style={{
              background: message.type === 'error'
                ? 'rgba(239,68,68,0.1)'
                : 'rgba(34,197,94,0.1)',
              border: `1px solid ${message.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
              color: message.type === 'error' ? '#f87171' : '#4ade80',
            }}
          >
            {message.text}
          </div>
        ) : null}
      </div>
    </div>
  );
}
