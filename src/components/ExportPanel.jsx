/**
 * ExportPanel.jsx
 * SVG/PNG 내보내기 — 브라우저 기본 다운로드(다운로드 폴더)만 사용
 */

import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { exportSVG, exportPNG } from './SyllableRenderer';
import { parseText } from '../utils/hangulDecompose';
import { useT } from '../utils/i18n';

const SIZE_OPTIONS = [
  { id: '200', label: '200', value: 200, title: '200px' },
  { id: '300', label: '300', value: 300, title: '300px' },
  { id: '500', label: '500', value: 500, title: '500px' },
  { id: '800', label: '800', value: 800, title: '800px' },
  { id: '1200', label: '1200', value: 1200, title: '1200px' },
];

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
  URL.revokeObjectURL(url);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** ZIP 파일명용: 입력 순서대로 한글만 이어 붙임 (예: 안녕하세요 → 안녕하세요) */
function buildExportBaseName(text) {
  const hangul = parseText(text || '')
    .filter(t => t.isHangul)
    .map(t => t.char)
    .join('');
  const sanitized = hangul
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .trim()
    .slice(0, 80);
  return sanitized || 'hangul';
}

export default function ExportPanel({ text, colors, layerOrder }) {
  const t = useT();
  const [outputSize, setOutputSize] = useState(800);
  const [useZip, setUseZip] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [message, setMessage] = useState(null);

  const syllables = parseText(text || '').filter(t => t.isHangul);
  const exportBaseName = buildExportBaseName(text);

  const showMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const exportManyAsZip = useCallback(async (addToZip) => {
    const zip = new JSZip();
    for (const syl of syllables) {
      await addToZip(zip, syl.char);
    }
    return zip.generateAsync({ type: 'blob' });
  }, [syllables]);

  const handleExportPNG = useCallback(async () => {
    if (syllables.length === 0) {
      showMessage(t('export.noHangul'), 'error');
      return;
    }
    setExporting('png');
    try {
      if (syllables.length === 1) {
        const blob = await exportPNG(syllables[0].char, colors, outputSize, layerOrder);
        if (!blob) throw new Error('PNG 변환 실패');
        downloadBlob(blob, `hangul_${syllables[0].char}_${outputSize}px.png`);
      } else if (useZip) {
        const blob = await exportManyAsZip(async (zip, char) => {
          const b = await exportPNG(char, colors, outputSize, layerOrder);
          if (b) zip.file(`hangul_${char}_${outputSize}px.png`, b);
        });
        downloadBlob(blob, `${exportBaseName}_png.zip`);
      } else {
        for (const syl of syllables) {
          const blob = await exportPNG(syl.char, colors, outputSize, layerOrder);
          if (blob) {
            downloadBlob(blob, `hangul_${syl.char}_${outputSize}px.png`);
            await delay(200);
          }
        }
      }
      showMessage(t('export.pngStarted'));
    } catch (err) {
      console.error(err);
      showMessage(`오류: ${err.message}`, 'error');
    }
    setExporting(null);
  }, [syllables, colors, outputSize, useZip, exportManyAsZip, exportBaseName, layerOrder]);

  const handleExportSVG = useCallback(async () => {
    if (syllables.length === 0) {
      showMessage(t('export.noHangul'), 'error');
      return;
    }
    setExporting('svg');
    try {
      if (syllables.length === 1) {
        const svgStr = exportSVG(syllables[0].char, colors, outputSize, layerOrder);
        if (!svgStr) throw new Error('SVG 생성 실패');
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        downloadBlob(blob, `hangul_${syllables[0].char}.svg`);
      } else if (useZip) {
        const blob = await exportManyAsZip(async (zip, char) => {
          const svgStr = exportSVG(char, colors, outputSize, layerOrder);
          if (svgStr) zip.file(`hangul_${char}.svg`, svgStr);
        });
        downloadBlob(blob, `${exportBaseName}_svg.zip`);
      } else {
        for (const syl of syllables) {
          const svgStr = exportSVG(syl.char, colors, outputSize, layerOrder);
          if (svgStr) {
            const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
            downloadBlob(blob, `hangul_${syl.char}.svg`);
            await delay(150);
          }
        }
      }
      showMessage(t('export.svgStarted'));
    } catch (err) {
      console.error(err);
      showMessage(`오류: ${err.message}`, 'error');
    }
    setExporting(null);
  }, [syllables, colors, outputSize, useZip, exportManyAsZip, exportBaseName, layerOrder]);


  return (
    <div className="export-panel flex flex-col gap-4">
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <span className="label-text" style={{ marginBottom: 0 }}>{t('export.outputSize')}</span>
          <span className="export-size-current">{outputSize}px</span>
        </div>
        <div className="export-size-row" role="radiogroup" aria-label="출력 크기">
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

      {syllables.length > 1 && (
        <div className="export-zip-block">
          <span className="label-text block mb-2">{t('export.multiTitle')}</span>
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
        </div>
      )}

      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(124,111,247,0.08)', border: '1px solid rgba(124,111,247,0.2)' }}
      >
        <div className="preview-bg-checker w-5 h-5 rounded flex-shrink-0" style={{ backgroundSize: '6px 6px' }} />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {t('export.transparentNote')}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="btn-primary w-full justify-center"
          onClick={handleExportPNG}
          disabled={!!exporting || syllables.length === 0}
          id="export-png-btn"
          style={{ opacity: exporting ? 0.7 : 1 }}
        >
          {exporting === 'png' ? <span className="animate-spin">⏳</span> : <span>🖼️</span>}
          {t('export.pngDownload')}
        </button>

        <button
          type="button"
          className="btn-secondary w-full justify-center"
          onClick={handleExportSVG}
          disabled={!!exporting || syllables.length === 0}
          id="export-svg-btn"
          style={{ opacity: exporting ? 0.7 : 1 }}
        >
          {exporting === 'svg' ? <span className="animate-spin">⏳</span> : <span>📐</span>}
          {t('export.svgDownload')}
        </button>
      </div>

      <div className="export-panel-feedback" aria-live="polite">
        {message ? (
          <div
            className="text-sm px-3 py-2 rounded-lg fade-in text-center w-full"
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
