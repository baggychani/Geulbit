/**
 * colorTemplates.js
 * 색 템플릿 데이터
 *
 * 기본(classic): 적녹색약 고려 — 빨강과 초록을 같이 쓰지 않음
 * 그 외 템플릿: 초록 포함 가능
 */

export const COLOR_TEMPLATES = [
  {
    id: 'classic',
    name: '기본',
    colors: { choseong: '#E53E3E', jungseong: '#3182CE', jongseong: '#718096' },
  },
  {
    id: 'vivid',
    name: '비비드',
    colors: { choseong: '#FF6B6B', jungseong: '#FFE66D', jongseong: '#4ECDC4' },
  },
  {
    id: 'pastel',
    name: '파스텔',
    colors: { choseong: '#FFB3BA', jungseong: '#BAE1FF', jongseong: '#BAFFC9' },
  },
  {
    id: 'mono',
    name: '흑백',
    colors: { choseong: '#1A1A1A', jungseong: '#555555', jongseong: '#999999' },
  },
  {
    id: 'warm',
    name: '웜톤',
    colors: { choseong: '#C0392B', jungseong: '#E67E22', jongseong: '#F1C40F' },
  },
  {
    id: 'cool',
    name: '쿨톤',
    colors: { choseong: '#1A237E', jungseong: '#0288D1', jongseong: '#00BCD4' },
  },
  {
    id: 'purple',
    name: '퍼플',
    colors: { choseong: '#6A1B9A', jungseong: '#9C27B0', jongseong: '#CE93D8' },
  },
  {
    id: 'neon',
    name: '네온',
    colors: { choseong: '#FF0090', jungseong: '#00FF88', jongseong: '#00CFFF' },
  },
  {
    id: 'forest',
    name: '포레스트',
    colors: { choseong: '#1B5E20', jungseong: '#43A047', jongseong: '#A5D6A7' },
  },
  {
    id: 'mint',
    name: '민트',
    colors: { choseong: '#00695C', jungseong: '#26A69A', jongseong: '#B2DFDB' },
  },
  {
    id: 'sunset',
    name: '선셋',
    colors: { choseong: '#D84315', jungseong: '#FB8C00', jongseong: '#F48FB1' },
  },
  {
    id: 'ocean',
    name: '오션',
    colors: { choseong: '#01579B', jungseong: '#039BE5', jongseong: '#80DEEA' },
  },
  {
    id: 'coral',
    name: '코랄',
    colors: { choseong: '#EF5350', jungseong: '#FF8A65', jongseong: '#FFCCBC' },
  },
  {
    id: 'ink',
    name: '잉크',
    colors: { choseong: '#263238', jungseong: '#546E7A', jongseong: '#B0BEC5' },
  },
  {
    id: 'candy',
    name: '캔디',
    colors: { choseong: '#EC407A', jungseong: '#AB47BC', jongseong: '#7E57C2' },
  },
  {
    id: 'autumn',
    name: '가을',
    colors: { choseong: '#BF360C', jungseong: '#EF6C00', jongseong: '#8D6E63' },
  },
  {
    id: 'sky',
    name: '하늘',
    colors: { choseong: '#1565C0', jungseong: '#42A5F5', jongseong: '#BBDEFB' },
  },
  {
    id: 'matcha',
    name: '말차',
    colors: { choseong: '#33691E', jungseong: '#7CB342', jongseong: '#DCEDC8' },
  },
];

export const DEFAULT_COLORS = COLOR_TEMPLATES[0].colors;

/** 미리보기 크기 (S/M/L) — 셀 자리는 항상 L 기준으로 고정 */
export const PREVIEW_SIZES = [
  { id: 'S', label: 'S', value: 100 },
  { id: 'M', label: 'M', value: 160 },
  { id: 'L', label: 'L', value: 220 },
];

export const PREVIEW_SIZE_MAX = PREVIEW_SIZES[PREVIEW_SIZES.length - 1].value;
