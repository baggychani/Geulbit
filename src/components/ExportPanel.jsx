/**
 * ExportPanel.jsx
 * SVG/PNG 내보내기 패널
 */

import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { exportSVG, exportPNG } from './SyllableRenderer';
import { parseText } from '../utils/hangulDecompose';

const SIZE_OPTIONS = [
  { label: '200px', value: 200 },
  { label: '300px', value: 300 },
  { label: '500px', value: 500 },
  { label: '800px (기본)', value: 800 },
  { label: '1200px (고해상)', value: 1200 },
];

export default function ExportPanel({ text, colors }) {
  const [outputSize, setOutputSize] = useState(800); // 800px 기본
  const [useZip, setUseZip] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [message, setMessage] = useState(null);

  const syllables = parseText(text || '').filter(t => t.isHangul);

  const showMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = useCallback(async () => {
    if (syllables.length === 0) {
      showMessage('내보낼 한글이 없습니다.', 'error');
      return;
    }
    setExporting('png');
    try {
      if (syllables.length === 1 || useZip) {
        let blob, ext, mimeType, filename;
        if (syllables.length === 1) {
          blob = await exportPNG(syllables[0].char, colors, outputSize);
          ext = 'png';
          mimeType = 'image/png';
          filename = `hangul_${syllables[0].char}_${outputSize}px.png`;
        } else {
          const zip = new JSZip();
          for (const syl of syllables) {
            const b = await exportPNG(syl.char, colors, outputSize);
            if (b) zip.file(`hangul_${syl.char}_${outputSize}px.png`, b);
          }
          blob = await zip.generateAsync({ type: 'blob' });
          ext = 'zip';
          mimeType = 'application/zip';
          filename = `hangul_png_bundle.zip`;
        }

        if (!blob) throw new Error('변환 실패');

        if (window.showSaveFilePicker) {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: filename,
              types: [{ description: ext.toUpperCase() + ' File', accept: { [mimeType]: ['.' + ext] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
          } catch (e) {
            if (e.name !== 'AbortError') throw e;
          }
        } else {
          downloadBlob(blob, filename);
        }
      } else {
        // 여러 파일 & ZIP 사용 안 함 -> 폴더 선택
        if (window.showDirectoryPicker) {
          try {
            const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            for (const syl of syllables) {
              const blob = await exportPNG(syl.char, colors, outputSize);
              if (!blob) continue;
              const handle = await dirHandle.getFileHandle(`hangul_${syl.char}_${outputSize}px.png`, { create: true });
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
            }
          } catch (e) {
            if (e.name !== 'AbortError') throw e;
          }
        } else {
          // Fallback
          for (const syl of syllables) {
            const blob = await exportPNG(syl.char, colors, outputSize);
            if (blob) downloadBlob(blob, `hangul_${syl.char}_${outputSize}px.png`);
            await new Promise(r => setTimeout(r, 150));
          }
        }
      }
      showMessage(`PNG 다운로드 완료 ✓`);
    } catch (err) {
      showMessage(`오류: ${err.message}`, 'error');
    }
    setExporting(null);
  }, [syllables, colors, outputSize, useZip]);

  const handleExportSVG = useCallback(async () => {
    if (syllables.length === 0) {
      showMessage('내보낼 한글이 없습니다.', 'error');
      return;
    }
    setExporting('svg');
    try {
      if (syllables.length === 1 || useZip) {
        let blob, ext, mimeType, filename;
        if (syllables.length === 1) {
          const svgStr = exportSVG(syllables[0].char, colors, outputSize);
          if (!svgStr) throw new Error('SVG 생성 실패');
          blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
          ext = 'svg';
          mimeType = 'image/svg+xml';
          filename = `hangul_${syllables[0].char}.svg`;
        } else {
          const zip = new JSZip();
          for (const syl of syllables) {
            const svgStr = exportSVG(syl.char, colors, outputSize);
            if (svgStr) zip.file(`hangul_${syl.char}.svg`, svgStr);
          }
          blob = await zip.generateAsync({ type: 'blob' });
          ext = 'zip';
          mimeType = 'application/zip';
          filename = `hangul_svg_bundle.zip`;
        }

        if (!blob) throw new Error('변환 실패');

        if (window.showSaveFilePicker) {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: filename,
              types: [{ description: ext.toUpperCase() + ' File', accept: { [mimeType]: ['.' + ext] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
          } catch (e) {
            if (e.name !== 'AbortError') throw e;
          }
        } else {
          downloadBlob(blob, filename);
        }
      } else {
        // 여러 파일 & ZIP 사용 안 함 -> 폴더 선택
        if (window.showDirectoryPicker) {
          try {
            const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            for (const syl of syllables) {
              const svgStr = exportSVG(syl.char, colors, outputSize);
              if (!svgStr) continue;
              const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
              const handle = await dirHandle.getFileHandle(`hangul_${syl.char}.svg`, { create: true });
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
            }
          } catch (e) {
            if (e.name !== 'AbortError') throw e;
          }
        } else {
          // Fallback
          for (const syl of syllables) {
            const svgStr = exportSVG(syl.char, colors, outputSize);
            if (svgStr) {
              const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
              downloadBlob(blob, `hangul_${syl.char}.svg`);
              await new Promise(r => setTimeout(r, 100));
            }
          }
        }
      }
      showMessage(`SVG 다운로드 완료 ✓`);
    } catch (err) {
      showMessage(`오류: ${err.message}`, 'error');
    }
    setExporting(null);
  }, [syllables, colors, outputSize, useZip]);

  return (
    <div className="flex flex-col gap-4">
      {/* 크기 선택 */}
      <div>
        <span className="label-text">출력 크기</span>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setOutputSize(opt.value)}
              className={outputSize === opt.value ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 12px', fontSize: 12 }}
              id={`size-${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 다중 파일 옵션 */}
      {syllables.length > 1 && (
        <div>
          <span className="label-text block mb-2">저장 방식 (다중 글자)</span>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            <input 
              type="checkbox" 
              checked={useZip} 
              onChange={e => setUseZip(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            하나의 ZIP 파일로 묶어서 저장하기
          </label>
        </div>
      )}

      {/* 배경 정보 */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(124,111,247,0.08)', border: '1px solid rgba(124,111,247,0.2)' }}
      >
        <div className="preview-bg-checker w-5 h-5 rounded flex-shrink-0" style={{ backgroundSize: '6px 6px' }} />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          투명 배경 PNG / SVG 출력
        </span>
      </div>

      {/* 다운로드 버튼 */}
      <div className="flex flex-col gap-2">
        <button
          className="btn-primary w-full justify-center"
          onClick={handleExportPNG}
          disabled={!!exporting || syllables.length === 0}
          id="export-png-btn"
          style={{ opacity: exporting ? 0.7 : 1 }}
        >
          {exporting === 'png' ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>🖼️</span>
          )}
          PNG 다운로드 ({outputSize}px, 투명)
        </button>

        <button
          className="btn-secondary w-full justify-center"
          onClick={handleExportSVG}
          disabled={!!exporting || syllables.length === 0}
          id="export-svg-btn"
          style={{ opacity: exporting ? 0.7 : 1 }}
        >
          {exporting === 'svg' ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>📐</span>
          )}
          SVG 다운로드 (벡터, 무손실)
        </button>
      </div>

      {/* 피드백 메시지 */}
      {message && (
        <div
          className="text-sm px-3 py-2 rounded-lg fade-in text-center"
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
      )}
    </div>
  );
}
