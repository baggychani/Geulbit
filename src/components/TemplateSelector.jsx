/**
 * TemplateSelector.jsx
 * 색 템플릿 선택 그리드
 */

import React from 'react';
import { COLOR_TEMPLATES } from '../utils/colorTemplates';

export default function TemplateSelector({ selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {COLOR_TEMPLATES.map(template => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className={`template-card ${selectedId === template.id ? 'selected' : ''}`}
          id={`template-${template.id}`}
          title={template.name}
        >
          {/* 색상 점 3개 미리보기 */}
          <div className="flex gap-1 flex-shrink-0">
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: template.colors.choseong,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: template.colors.jungseong,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: template.colors.jongseong,
                flexShrink: 0,
              }}
            />
          </div>
          <span className="text-xs font-medium truncate">{template.name}</span>
          {selectedId === template.id && (
            <span className="ml-auto text-xs" style={{ color: 'var(--accent)' }}>✓</span>
          )}
        </button>
      ))}
    </div>
  );
}
