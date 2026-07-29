/**
 * colorTemplates.js
 * 색 템플릿 데이터
 */

export const COLOR_TEMPLATES = [
  {
    id: 'classic',
    name: '기본',
    emoji: '🔴',
    colors: { choseong: '#E53E3E', jungseong: '#3182CE', jongseong: '#38A169' },
  },
  {
    id: 'vivid',
    name: '비비드',
    emoji: '🌈',
    colors: { choseong: '#FF6B6B', jungseong: '#FFE66D', jongseong: '#4ECDC4' },
  },
  {
    id: 'pastel',
    name: '파스텔',
    emoji: '🍬',
    colors: { choseong: '#FFB3BA', jungseong: '#BAE1FF', jongseong: '#BAFFC9' },
  },
  {
    id: 'mono',
    name: '흑백',
    emoji: '⬛',
    colors: { choseong: '#1A1A1A', jungseong: '#555555', jongseong: '#999999' },
  },
  {
    id: 'warm',
    name: '웜톤',
    emoji: '🔥',
    colors: { choseong: '#C0392B', jungseong: '#E67E22', jongseong: '#F1C40F' },
  },
  {
    id: 'cool',
    name: '쿨톤',
    emoji: '💙',
    colors: { choseong: '#1A237E', jungseong: '#0288D1', jongseong: '#00BCD4' },
  },
  {
    id: 'purple',
    name: '퍼플',
    emoji: '💜',
    colors: { choseong: '#6A1B9A', jungseong: '#9C27B0', jongseong: '#CE93D8' },
  },
  {
    id: 'neon',
    name: '네온',
    emoji: '⚡',
    colors: { choseong: '#FF0090', jungseong: '#00FF88', jongseong: '#00CFFF' },
  },
];

export const DEFAULT_COLORS = COLOR_TEMPLATES[0].colors;
