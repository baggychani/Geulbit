/**
 * TemplateSelector.jsx
 * 색 템플릿 선택 그리드
 */

import { COLOR_TEMPLATES } from '../utils/colorTemplates';
import { useT } from '../utils/i18n';

export default function TemplateSelector({ selectedId, onSelect }) {
  const t = useT();
  return (
    <div className="grid grid-cols-2 gap-2">
      {COLOR_TEMPLATES.map(template => (
        <button
          key={template.id}
          type="button"
          onClick={() => onSelect(template)}
          className={`template-card ${selectedId === template.id ? 'selected' : ''}`}
          id={`template-${template.id}`}
          title={t('tpl.' + template.name)}
        >
          {/* 초·중·종 색상 스트립 */}
          <div className="template-swatch" aria-hidden>
            <span style={{ background: template.colors.choseong }} />
            <span style={{ background: template.colors.jungseong }} />
            <span style={{ background: template.colors.jongseong }} />
          </div>
          <span className="text-xs font-medium truncate">{t('tpl.' + template.name)}</span>
          {selectedId === template.id && (
            <span className="ml-auto text-xs" style={{ color: 'var(--accent)' }}>✓</span>
          )}
        </button>
      ))}
    </div>
  );
}
