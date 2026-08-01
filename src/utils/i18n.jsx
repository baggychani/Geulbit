/**
 * i18n.js
 * 한국어(ko) / 영어(en) / 터키어(tr) 하드코딩 번역 사전 + React Context
 *
 * 사용법:
 *   import { I18nProvider, useT } from '../utils/i18n';
 *   const t = useT();
 *   <span>{t('header.title')}</span>
 */

import { createContext, useContext, useState, useCallback } from 'react';

// ──────────────────────────────────────────────
// 번역 사전
// ──────────────────────────────────────────────
const dict = {
  // ─── 헤더 ───
  'header.title': {
    ko: '글빛 — 한글 팔레트',
    tr: 'Geulbit — Hangeul Paleti',
  },
  'header.subtitle': {
    ko: '초성·중성·종성 컬러 이미지 스튜디오',
    tr: 'Başlangıç·Orta·Son Hece Renk Stüdyosu',
  },

  // ─── 폰트 상태 ───
  'font.loading': {
    ko: '로딩 중',
    tr: 'Yükleniyor',
  },
  'font.error': {
    ko: '폰트 오류',
    tr: 'Yazı tipi hatası',
  },
  'font.loadingMsg': {
    ko: '폰트 로딩 중...',
    tr: 'Yazı tipi yükleniyor...',
  },
  'font.loadFailed': {
    ko: '폰트를 불러올 수 없습니다.',
    tr: 'Yazı tipi yüklenemedi.',
  },

  // ─── 폰트 굵기 ───
  'font.regular': {
    ko: '일반',
    tr: 'Normal',
  },
  'font.bold': {
    ko: '굵게',
    tr: 'Kalın',
  },
  'font.weight': {
    ko: '글꼴 굵기',
    tr: 'Yazı tipi kalınlığı',
  },

  // ─── 테마 ───
  'theme.toLight': {
    ko: '라이트 모드로 전환',
    tr: 'Açık moda geç',
  },
  'theme.toDark': {
    ko: '다크 모드로 전환',
    tr: 'Koyu moda geç',
  },

  // ─── 글자 입력 ───
  'input.title': {
    ko: '글자 입력',
    tr: 'Karakter Girişi',
  },
  'input.placeholder': {
    ko: '한글을 입력하세요\n예: 한글',
    tr: 'Hangeul yazın\nÖrn: 한글',
  },
  'input.examples': {
    ko: '예시:',
    tr: 'Örnekler:',
  },

  // ─── 탭 ───
  'tab.color': {
    ko: '색상',
    tr: 'Renk',
  },
  'tab.template': {
    ko: '템플릿',
    tr: 'Şablon',
  },
  'tab.export': {
    ko: '내보내기',
    tr: 'Dışa Aktar',
  },

  // ─── 미리보기 ───
  'preview.title': {
    ko: '미리보기',
    tr: 'Önizleme',
  },
  'preview.syllableCount': {
    ko: '음절',
    tr: 'hece',
  },
  'preview.enterHangul': {
    ko: '왼쪽에 한글을 입력하세요',
    tr: 'Sol panele Hangeul yazın',
  },
  'preview.background': {
    ko: '미리보기 배경',
    tr: 'Önizleme arka planı',
  },
  'preview.checkerBackground': {
    ko: '투명 격자 배경',
    tr: 'Saydam dama arka planı',
  },
  'preview.solidBackground': {
    ko: '단색 배경',
    tr: 'Düz renk arka planı',
  },
  'preview.size': {
    ko: '미리보기 크기',
    tr: 'Önizleme boyutu',
  },

  // ─── 색상 범례 ───
  'legend.choseong': {
    ko: '초성',
    tr: 'Başlangıç',
  },
  'legend.jungseong': {
    ko: '중성',
    tr: 'Orta',
  },
  'legend.jongseong': {
    ko: '종성 (받침)',
    tr: 'Son (batchim)',
  },

  // ─── ColorPicker ───
  'color.choseong': {
    ko: '초성',
    tr: 'Başlangıç',
  },
  'color.jungseong': {
    ko: '중성',
    tr: 'Orta',
  },
  'color.jongseong': {
    ko: '종성',
    tr: 'Son',
  },
  'color.jongseongDesc': {
    ko: '받침',
    tr: 'batchim',
  },
  'color.selectColor': {
    ko: '색상 선택',
    tr: 'Renk seç',
  },

  // ─── 획 겹침 우선순위 ───
  'zorder.title': {
    ko: '획 겹침 우선순위',
    tr: 'Katman Önceliği',
  },
  'zorder.topHint': {
    ko: '맨 위에 올릴 자소',
    tr: 'En üstteki harf',
  },
  'zorder.choseong_top': {
    ko: '초성',
    tr: 'Başlangıç',
  },
  'zorder.jungseong_top': {
    ko: '중성',
    tr: 'Orta',
  },
  'zorder.jongseong_top': {
    ko: '종성',
    tr: 'Son',
  },
  'zorder.recommended': {
    ko: '권장',
    tr: 'Önerilen',
  },

  // ─── 배치 모드 ───
  'mode.title': {
    ko: '배치 모드',
    tr: 'Yerleşim Modu',
  },
  'mode.classic': {
    ko: '기본 모아쓰기',
    tr: 'Birleşik',
  },
  'mode.grid': {
    ko: '자모 그리드',
    tr: 'Harf Izgarası',
  },

  // ─── 음절 분석 ───
  'analysis.title': {
    ko: '음절 분석',
    tr: 'Hece Analizi',
  },
  'analysis.choseong': {
    ko: '초성',
    tr: 'Başlangıç',
  },
  'analysis.jungseong': {
    ko: '중성',
    tr: 'Orta',
  },
  'analysis.jongseong': {
    ko: '종성',
    tr: 'Son',
  },
  'analysis.noJongseong': {
    ko: '종성: 없음',
    tr: 'Son: yok',
  },
  'analysis.verticalVowel': {
    ko: '↕ 수직모음',
    tr: '↕ Dikey ünlü',
  },
  'analysis.horizontalVowel': {
    ko: '↔ 수평모음',
    tr: '↔ Yatay ünlü',
  },

  // ─── 사용 방법 ───
  'howto.title': {
    ko: '사용 방법',
    tr: 'Nasıl Kullanılır',
  },
  'howto.step1': {
    ko: '왼쪽 "글자 입력" 창에 한글을 입력합니다.',
    tr: 'Sol paneldeki "Karakter Girişi" alanına Hangeul yazın.',
  },
  'howto.step2': {
    ko: '"색상" 탭에서 초성·중성·종성의 색을 각각 설정합니다.',
    tr: '"Renk" sekmesinden Başlangıç·Orta·Son renklerini ayarlayın.',
  },
  'howto.step3': {
    ko: '또는 "템플릿" 탭에서 미리 정의된 색 조합을 선택합니다.',
    tr: 'Ya da "Şablon" sekmesinden hazır renk kombinasyonlarını seçin.',
  },
  'howto.step4': {
    ko: '미리보기에서 색채가 분리된 글자를 확인합니다.',
    tr: 'Önizlemede renklendirilmiş karakterleri kontrol edin.',
  },
  'howto.step5': {
    ko: '"내보내기" 탭에서 SVG 또는 투명 PNG로 다운로드합니다.',
    tr: '"Dışa Aktar" sekmesinden SVG veya şeffaf PNG olarak indirin.',
  },

  // ─── ExportPanel ───
  'export.outputSize': {
    ko: '출력 크기',
    tr: 'Çıktı Boyutu',
  },
  'export.sizeDefault': {
    ko: '기본',
    tr: 'Varsayılan',
  },
  'export.sizeHigh': {
    ko: '고해상',
    tr: 'Yüksek çözünürlük',
  },
  'export.multiTitle': {
    ko: '내보내기 옵션',
    tr: 'Dışa Aktarma Seçenekleri',
  },
  'export.dedupeLabel': {
    ko: '중복 글자 건너뛰기 (권장)',
    tr: 'Yinelenenleri atla (önerilen)',
  },
  'export.dedupeHint': {
    ko: '같은 글자는 한 번만 내보냅니다.',
    tr: 'Aynı karakteri yalnızca bir kez dışa aktarır.',
  },
  'export.zipLabel': {
    ko: 'ZIP 파일 하나로 받기 (권장)',
    tr: 'Tek ZIP dosyası olarak indir (önerilen)',
  },
  'export.zipHintOn': {
    ko: '선택한 크기의 PNG/SVG가 ZIP 하나로 저장됩니다.',
    tr: 'Seçili boyuttaki PNG/SVG dosyaları tek ZIP olarak kaydedilir.',
  },
  'export.zipHintOff': {
    ko: '글자마다 PNG/SVG 파일이 순서대로 다운로드됩니다.',
    tr: 'Her karakter için PNG/SVG dosyaları sırayla indirilir.',
  },
  'export.transparentNote': {
    ko: '투명 배경 · 브라우저 기본 다운로드 폴더에 저장됩니다',
    tr: 'Şeffaf arka plan · Tarayıcı indirme klasörüne kaydedilir',
  },
  'export.pngDownload': {
    ko: 'PNG 다운로드',
    tr: 'PNG İndir',
  },
  'export.svgDownload': {
    ko: 'SVG 다운로드',
    tr: 'SVG İndir',
  },
  'export.noHangul': {
    ko: '내보낼 한글이 없습니다.',
    tr: 'Dışa aktarılacak Hangeul yok.',
  },
  'export.pngStarted': {
    ko: 'PNG 다운로드를 시작했습니다.',
    tr: 'PNG indirme başlatıldı.',
  },
  'export.svgStarted': {
    ko: 'SVG 다운로드를 시작했습니다.',
    tr: 'SVG indirme başlatıldı.',
  },

  // ─── SyllableRenderer ───
  'export.inProgress': {
    ko: '내보내는 중',
    tr: 'Dışa aktarılıyor',
  },
  'export.cancel': {
    ko: '취소',
    tr: 'İptal',
  },
  'export.cancelled': {
    ko: '내보내기를 취소했습니다.',
    tr: 'Dışa aktarma iptal edildi.',
  },
  'export.failedChars': {
    ko: '변환에 실패한 글자',
    tr: 'Dönüştürülemeyen karakterler',
  },
  'export.errorPrefix': {
    ko: '오류',
    tr: 'Hata',
  },

  'syllable.copyPNG': {
    ko: 'PNG 복사하기',
    tr: 'PNG Kopyala',
  },
  'syllable.copied': {
    ko: '복사됨!',
    tr: 'Kopyalandı!',
  },
  'syllable.copyError': {
    ko: '오류',
    tr: 'Hata',
  },
  'syllable.extractFail': {
    ko: '글리프 추출 실패',
    tr: 'Glif çıkarılamadı.',
  },

  // ─── 템플릿 이름 ───
  'tpl.기본': { ko: '기본', tr: 'Klasik' },
  'tpl.비비드': { ko: '비비드', tr: 'Canlı' },
  'tpl.파스텔': { ko: '파스텔', tr: 'Pastel' },
  'tpl.흑백': { ko: '흑백', tr: 'Siyah-Beyaz' },
  'tpl.웜톤': { ko: '웜톤', tr: 'Sıcak Ton' },
  'tpl.쿨톤': { ko: '쿨톤', tr: 'Soğuk Ton' },
  'tpl.퍼플': { ko: '퍼플', tr: 'Mor' },
  'tpl.네온': { ko: '네온', tr: 'Neon' },
  'tpl.포레스트': { ko: '포레스트', tr: 'Orman' },
  'tpl.민트': { ko: '민트', tr: 'Nane' },
  'tpl.선셋': { ko: '선셋', tr: 'Gün Batımı' },
  'tpl.오션': { ko: '오션', tr: 'Okyanus' },
  'tpl.코랄': { ko: '코랄', tr: 'Mercan' },
  'tpl.잉크': { ko: '잉크', tr: 'Mürekkep' },
  'tpl.캔디': { ko: '캔디', tr: 'Şeker' },
  'tpl.가을': { ko: '가을', tr: 'Sonbahar' },
  'tpl.하늘': { ko: '하늘', tr: 'Gökyüzü' },
  'tpl.말차': { ko: '말차', tr: 'Matcha' },

  // ─── 언어 선택 ───
  'lang.ko': {
    ko: '한국어',
    tr: 'Korece',
  },
  'lang.selector': {
    ko: '언어',
    tr: 'Dil',
  },
  'lang.en': {
    ko: '영어',
    en: 'English',
    tr: 'İngilizce',
  },
  'lang.tr': {
    ko: 'Türkçe',
    tr: 'Türkçe',
  },
};

const english = {
  'header.title': 'Geulbit — Hangeul Palette',
  'header.subtitle': 'Initial · Medial · Final Color Image Studio',
  'font.loading': 'Loading',
  'font.error': 'Font error',
  'font.loadingMsg': 'Loading font...',
  'font.loadFailed': 'The font could not be loaded.',
  'font.regular': 'Regular',
  'font.bold': 'Bold',
  'font.weight': 'Font weight',
  'theme.toLight': 'Switch to light mode',
  'theme.toDark': 'Switch to dark mode',
  'input.title': 'Text input',
  'input.placeholder': 'Enter Hangeul\nExample: 한글',
  'input.examples': 'Examples:',
  'tab.color': 'Colors',
  'tab.template': 'Templates',
  'tab.export': 'Export',
  'preview.title': 'Preview',
  'preview.syllableCount': 'syllables',
  'preview.enterHangul': 'Enter Hangeul in the panel on the left',
  'preview.background': 'Preview background',
  'preview.checkerBackground': 'Transparent checkerboard background',
  'preview.solidBackground': 'Solid background',
  'preview.size': 'Preview size',
  'legend.choseong': 'Initial',
  'legend.jungseong': 'Medial',
  'legend.jongseong': 'Final (batchim)',
  'color.choseong': 'Initial',
  'color.jungseong': 'Medial',
  'color.jongseong': 'Final',
  'color.jongseongDesc': 'batchim',
  'color.selectColor': 'Choose color',
  'zorder.title': 'Stroke overlap order',
  'zorder.topHint': 'Jamo rendered on top',
  'zorder.choseong_top': 'Initial',
  'zorder.jungseong_top': 'Medial',
  'zorder.jongseong_top': 'Final',
  'zorder.recommended': 'Recommended',
  'mode.title': 'Layout mode',
  'mode.classic': 'Combined syllable',
  'mode.grid': 'Jamo grid',
  'analysis.title': 'Syllable analysis',
  'analysis.choseong': 'Initial',
  'analysis.jungseong': 'Medial',
  'analysis.jongseong': 'Final',
  'analysis.noJongseong': 'Final: none',
  'analysis.verticalVowel': '↕ Vertical vowel',
  'analysis.horizontalVowel': '↔ Horizontal vowel',
  'howto.title': 'How to use',
  'howto.step1': 'Enter Hangeul in the “Text input” field on the left.',
  'howto.step2': 'Set colors for the initial, medial, and final jamo in “Colors”.',
  'howto.step3': 'Or select a predefined color combination in “Templates”.',
  'howto.step4': 'Check the color-separated syllables in the preview.',
  'howto.step5': 'Download SVG or transparent PNG from “Export”.',
  'export.outputSize': 'Output size',
  'export.sizeDefault': 'Default',
  'export.sizeHigh': 'High resolution',
  'export.multiTitle': 'Export options',
  'export.dedupeLabel': 'Skip duplicate characters (recommended)',
  'export.dedupeHint': 'Exports each character only once.',
  'export.zipLabel': 'Download as one ZIP file (recommended)',
  'export.zipHintOn': 'PNG/SVG files at the selected size are saved in one ZIP.',
  'export.zipHintOff': 'PNG/SVG files download in order for each character.',
  'export.transparentNote': 'Transparent background · saved to your browser download folder',
  'export.pngDownload': 'Download PNG',
  'export.svgDownload': 'Download SVG',
  'export.noHangul': 'There is no Hangeul to export.',
  'export.pngStarted': 'PNG download started.',
  'export.svgStarted': 'SVG download started.',
  'export.inProgress': 'Exporting',
  'export.cancel': 'Cancel',
  'export.cancelled': 'Export cancelled.',
  'export.failedChars': 'Characters that failed to convert',
  'export.errorPrefix': 'Error',
  'syllable.copyPNG': 'Copy PNG',
  'syllable.copied': 'Copied!',
  'syllable.copyError': 'Error',
  'syllable.extractFail': 'Glyph extraction failed',
  'tpl.기본': 'Classic',
  'tpl.비비드': 'Vivid',
  'tpl.파스텔': 'Pastel',
  'tpl.흑백': 'Monochrome',
  'tpl.웜톤': 'Warm',
  'tpl.쿨톤': 'Cool',
  'tpl.퍼플': 'Purple',
  'tpl.네온': 'Neon',
  'tpl.포레스트': 'Forest',
  'tpl.민트': 'Mint',
  'tpl.선셋': 'Sunset',
  'tpl.오션': 'Ocean',
  'tpl.코랄': 'Coral',
  'tpl.잉크': 'Ink',
  'tpl.캔디': 'Candy',
  'tpl.가을': 'Autumn',
  'tpl.하늘': 'Sky',
  'tpl.말차': 'Matcha',
  'lang.ko': 'Korean',
  'lang.selector': 'Language',
  'lang.en': 'English',
  'lang.tr': 'Turkish',
};

// ──────────────────────────────────────────────
// React Context
// ──────────────────────────────────────────────
const I18nContext = createContext({
  lang: 'ko',
  setLang: () => {},
  t: (key) => key,
});

/**
 * 번역 함수 (Context 외부에서도 사용 가능)
 */
export function translate(key, lang = 'ko') {
  const entry = dict[key];
  if (!entry) return key;
  return entry[lang] ?? english[key] ?? entry.ko ?? key;
}

/**
 * Provider: App 최상단에 감싸기
 */
export function I18nProvider({ children }) {
  const [lang, setLang] = useState('ko');

  const t = useCallback((key) => translate(key, lang), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook: 컴포넌트에서 t 함수 사용
 */
export function useT() {
  const { t } = useContext(I18nContext);
  return t;
}

/**
 * Hook: lang 상태 + setLang
 */
export function useLang() {
  const { lang, setLang } = useContext(I18nContext);
  return [lang, setLang];
}

export default dict;
