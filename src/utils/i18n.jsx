/**
 * i18n.js
 * 한국어(ko) / 터키어(tr) 하드코딩 번역 사전 + React Context
 *
 * 사용법:
 *   import { I18nProvider, useT } from '../utils/i18n';
 *   const t = useT();
 *   <span>{t('header.title')}</span>
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

// ──────────────────────────────────────────────
// 번역 사전
// ──────────────────────────────────────────────
const dict = {
  // ─── 헤더 ───
  'header.title': {
    ko: '글빛 — 한글 팔레트',
    tr: 'Geulbit — Hangıl Paleti',
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
    tr: 'Hangıl yazın\nÖrn: 한글',
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
    tr: 'Sol panele Hangıl yazın',
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
    tr: 'Son (Batchim)',
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
    tr: 'Batchim',
  },
  'color.selectColor': {
    ko: '색상 선택',
    tr: 'Renk seç',
  },

  // ─── Z-Order ───
  'zorder.title': {
    ko: '획 겹침 순서 (Z-Order)',
    tr: 'Çizgi Katman Sırası (Z-Order)',
  },
  'zorder.choseong_top': {
    ko: '초성 맨 위 (권장)',
    tr: 'Başlangıç üstte (önerilen)',
  },
  'zorder.jungseong_top': {
    ko: '중성 맨 위',
    tr: 'Orta üstte',
  },
  'zorder.jongseong_top': {
    ko: '종성 맨 위',
    tr: 'Son üstte',
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
    tr: 'Sol paneldeki "Karakter Girişi" alanına Hangıl yazın.',
  },
  'howto.step2': {
    ko: '"색상" 탭에서 초성·중성·종성의 색을 각각 설정하거나,',
    tr: '"Renk" sekmesinden Başlangıç·Orta·Son renklerini ayarlayın veya',
  },
  'howto.step3': {
    ko: '"템플릿" 탭에서 미리 정의된 색 조합을 선택합니다.',
    tr: '"Şablon" sekmesinden hazır renk kombinasyonlarını seçin.',
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
    tr: 'Yüksek çöz.',
  },
  'export.multiTitle': {
    ko: '여러 글자일 때',
    tr: 'Birden fazla karakter',
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
    tr: 'Dışa aktarılacak Hangıl yok.',
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
    tr: 'Glif çıkarma başarısız',
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
  'lang.tr': {
    ko: 'Türkçe',
    tr: 'Türkçe',
  },
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
  return entry[lang] ?? entry.ko ?? key;
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
