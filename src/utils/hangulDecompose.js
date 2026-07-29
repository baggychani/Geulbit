/**
 * hangulDecompose.js
 * 한글 음절 유니코드 분해 유틸리티
 * 
 * 유니코드 한글 음절 범위: U+AC00 ~ U+D7A3 (11172자)
 * 공식: syllable = 초성 × 588 + 중성 × 28 + 종성 + 0xAC00
 */

// 초성 (19개)
export const CHOSEONG_LIST = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ',
  'ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];

// 중성 (21개)
export const JUNGSEONG_LIST = [
  'ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ',
  'ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'
];

// 종성 (28개, 0번은 받침 없음)
export const JONGSEONG_LIST = [
  '','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ',
  'ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];

// 수직 모음 (중성이 오른쪽에 배치되는 모음들)
export const VERTICAL_VOWELS = new Set([0,1,2,3,4,5,6,7,20]); // ㅏㅐㅑㅒㅓㅔㅕㅖㅣ

// 수평 모음 (중성이 아래쪽에 배치되는 모음들)
export const HORIZONTAL_VOWELS = new Set([8, 12, 13, 17, 18]); // ㅗㅛㅜㅠㅡ

// 이중 모음 / 복합 모음 (ㅘ ㅙ ㅚ ㅝ ㅞ ㅟ ㅢ)
export const DIPHTHONG_VOWELS = new Set([9, 10, 11, 14, 15, 16, 19]);

/**
 * 한글 음절인지 확인
 */
export function isHangulSyllable(char) {
  const code = char.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
}

/**
 * 한글 음절을 초성/중성/종성 인덱스로 분해
 */
export function decomposeHangul(char) {
  if (!isHangulSyllable(char)) return null;
  
  const code = char.charCodeAt(0) - 0xAC00;
  const jongseong = code % 28;
  const jungseong = Math.floor(code / 28) % 21;
  const choseong = Math.floor(code / 588);
  
  return {
    char,
    choseong: { index: choseong, jamo: CHOSEONG_LIST[choseong] },
    jungseong: { index: jungseong, jamo: JUNGSEONG_LIST[jungseong] },
    jongseong: { index: jongseong, jamo: JONGSEONG_LIST[jongseong] },
    hasJongseong: jongseong > 0,
    isVerticalVowel: VERTICAL_VOWELS.has(jungseong),
    isHorizontalVowel: HORIZONTAL_VOWELS.has(jungseong),
    isDiphthong: DIPHTHONG_VOWELS.has(jungseong),
  };
}

/**
 * 텍스트에서 한글 음절 배열 추출 (비한글 포함)
 */
export function parseText(text) {
  return [...text].map(char => ({
    char,
    isHangul: isHangulSyllable(char),
    decomposed: isHangulSyllable(char) ? decomposeHangul(char) : null,
  }));
}

/**
 * 컴포넌트 인덱스(0,1,2)를 자소 유형으로 분류
 *
 * UnDotum composite glyph 실제 순서 (전체 음절 검증):
 *   - 받침 없음 (2컴포넌트): [초성, 중성]
 *   - 받침 있음 (3컴포넌트): [초성, 종성, 중성]  ← 중·종이 흔히 아는 순서와 다름
 *
 * 종성은 bbox 기준 가장 아래에 오며, 샘플 검증에서 항상 index 1.
 */
export function classifyComponents(components, decomposed) {
  if (!decomposed || !components || components.length === 0) return [];

  const { hasJongseong } = decomposed;
  const result = [];

  if (hasJongseong && components.length >= 3) {
    // [초성, 종성, 중성...]
    for (let i = 0; i < components.length; i++) {
      if (i === 0) {
        result.push({ ...components[i], type: 'choseong' });
      } else if (i === 1) {
        result.push({ ...components[i], type: 'jongseong' });
      } else {
        result.push({ ...components[i], type: 'jungseong' });
      }
    }
  } else if (hasJongseong && components.length === 2) {
    // 예외: 종성 있는 음절인데 2개만 온 경우 → 위치(아래=종성)로 판별은
    // 호출 측 spatial fallback에 맡기고, 여기선 보수적으로 [초, 중] 취급하지 않음.
    // UnDotum에서는 발생하지 않음. 폴백: 첫=초, 둘=종.
    result.push({ ...components[0], type: 'choseong' });
    result.push({ ...components[1], type: 'jongseong' });
  } else {
    // 받침 없음: [초성, 중성...]
    for (let i = 0; i < components.length; i++) {
      if (i === 0) {
        result.push({ ...components[i], type: 'choseong' });
      } else {
        result.push({ ...components[i], type: 'jungseong' });
      }
    }
  }

  return result;
}
